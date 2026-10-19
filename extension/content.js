(() => {
  if (window.__imgPickerInjected) return;
  window.__imgPickerInjected = true;

  const btn = document.createElement('button');
  btn.id = 'img-picker-fetch-btn';
  btn.textContent = '获取图片';
  btn.title = '提取当前页面的所有图片';
  document.documentElement.appendChild(btn);

  btn.addEventListener('click', () => {
    const urls = [];
    const seen = new Set();

    const push = (u) => {
      if (!u) return;
      if (u.startsWith('data:') || u.startsWith('blob:')) return;
      if (seen.has(u)) return;
      seen.add(u);
      if (urls.length < 400) urls.push(u);
    };

    // 1) 普通图片（过滤掉过小的图标/占位图）
    document.querySelectorAll('img').forEach((img) => {
      const src = img.currentSrc || img.src;
      if (!src) return;
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      if ((w && w < 80) || (h && h < 80)) return;
      push(src);
    });

    // 2) 背景图
    document.querySelectorAll('*').forEach((el) => {
      const bg = getComputedStyle(el).backgroundImage;
      if (bg && bg !== 'none') {
        const m = bg.match(/url\(["']?(.*?)["']?\)/);
        if (m && m[1]) push(m[1]);
      }
    });

    chrome.storage.local.set(
      { imgPickerUrls: urls, imgPickerTitle: document.title },
      () => {
        window.open(chrome.runtime.getURL('viewer.html'), '_blank');
      }
    );
  });
})();
