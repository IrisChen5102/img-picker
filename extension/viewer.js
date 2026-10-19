const state = { urls: [], selected: new Set() };
const grid = document.getElementById('grid');
const countEl = document.getElementById('count');
const statusEl = document.getElementById('status');
const zipBtn = document.getElementById('zip');
const emptyEl = document.getElementById('empty');

function fileNameFromUrl(url, i) {
  try {
    const clean = new URL(url).pathname.split('/').pop().split('?')[0];
    if (clean && /\.(png|jpe?g|webp|gif|bmp)$/i.test(clean)) return clean;
  } catch (e) {}
  return `image_${String(i + 1).padStart(3, '0')}.jpg`;
}

function updateCount() {
  countEl.textContent = `共 ${state.urls.length} 张 · 已选 ${state.selected.size} 张`;
}

function render() {
  grid.innerHTML = '';
  state.urls.forEach((url, i) => {
    const card = document.createElement('div');
    card.className = 'card';

    const img = document.createElement('img');
    img.src = url;
    img.loading = 'lazy';
    img.alt = `图片 ${i + 1}`;

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = state.selected.has(i);
    cb.addEventListener('change', () => {
      if (cb.checked) state.selected.add(i);
      else state.selected.delete(i);
      updateCount();
    });

    const meta = document.createElement('div');
    meta.className = 'meta';
    const name = document.createElement('span');
    name.textContent = fileNameFromUrl(url, i);
    const dl = document.createElement('button');
    dl.className = 'dl';
    dl.textContent = '单张下载';
    dl.addEventListener('click', () => {
      chrome.downloads.download({
        url,
        filename: '图集助手/' + fileNameFromUrl(url, i),
        conflictAction: 'uniquify',
      });
    });
    meta.appendChild(name);
    meta.appendChild(dl);

    card.appendChild(img);
    card.appendChild(cb);
    card.appendChild(meta);
    grid.appendChild(card);
  });
  emptyEl.hidden = state.urls.length > 0;
  updateCount();
}

document.getElementById('selectAll').addEventListener('click', () => {
  state.urls.forEach((_, i) => state.selected.add(i));
  document.querySelectorAll('.card input[type=checkbox]').forEach((c) => (c.checked = true));
  updateCount();
});

document.getElementById('selectNone').addEventListener('click', () => {
  state.selected.clear();
  document.querySelectorAll('.card input[type=checkbox]').forEach((c) => (c.checked = false));
  updateCount();
});

zipBtn.addEventListener('click', async () => {
  const idx = [...state.selected].sort((a, b) => a - b);
  if (!idx.length) {
    statusEl.textContent = '还没勾选图片';
    return;
  }
  statusEl.textContent = '正在打包…';
  zipBtn.disabled = true;

  const zip = new JSZip();
  const used = new Map();
  const uniq = (n) => {
    const c = used.get(n) || 0;
    used.set(n, c + 1);
    return c ? n.replace(/(\.[^.]+)?$/, `_${c}$1`) : n;
  };

  let ok = 0;
  for (let k = 0; k < idx.length; k++) {
    const i = idx[k];
    try {
      const res = await fetch(state.urls[i]);
      if (!res.ok) throw new Error(res.status);
      const blob = await res.blob();
      zip.file(uniq(fileNameFromUrl(state.urls[i], i)), blob);
      ok++;
    } catch (e) {}
    statusEl.textContent = `正在打包… ${k + 1}/${idx.length}`;
  }

  if (!ok) {
    statusEl.textContent = '打包失败：图片都读不到';
    zipBtn.disabled = false;
    return;
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `图集助手图片_${Date.now()}.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 3000);
  statusEl.textContent = `打包完成，共 ${ok} 张`;
  zipBtn.disabled = false;
});

chrome.storage.local.get(['imgPickerUrls'], (data) => {
  state.urls = Array.isArray(data.imgPickerUrls) ? data.imgPickerUrls : [];
  state.urls.forEach((_, i) => state.selected.add(i));
  document.title = `图集助手 · ${state.urls.length} 张图片`;
  render();
});
