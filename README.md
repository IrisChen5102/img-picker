# 图集助手（Image Picker）

一个 Chrome 浏览器扩展：在电商详情页一键提取页面图片，勾选后支持单张下载或批量打包为 zip。

## 功能

- 一键提取商品详情页中的所有图片（含背景图，自动过滤小图标）
- 图片列表预览，支持全选 / 取消全选 / 单张勾选
- 单张直接下载；批量下载自动打包 zip
- 支持平台：淘宝、天猫、京东、拼多多

## 目录结构

```
img-picker/
├── extension/          # 插件本体（加载此文件夹）
│   ├── manifest.json   # Manifest V3 配置
│   ├── content.js      # 页面注入：右下角「获取图片」按钮
│   ├── content.css     # 按钮样式
│   ├── viewer.html     # 图片列表页
│   ├── viewer.js       # 列表交互 + 下载 + zip 打包
│   └── jszip.min.js    # JSZip 3.10.1（打包 zip 用）
├── docs/               # 官网静态页（GitHub Pages 从该目录发布）
│   ├── index.html
│   └── plugin.zip      # 插件安装包（官网下载按钮指向它）
└── README.md
```

## 安装

1. Chrome 地址栏打开 `chrome://extensions`，开启「开发者模式」
2. 点击「加载已解压的扩展程序」，选择 `extension/` 文件夹

## 使用

1. 打开淘宝 / 天猫 / 京东 / 拼多多商品详情页
2. 先把页面往下滚动一遍，让图片加载出来
3. 点击右下角橙色「获取图片」按钮
4. 在弹出的列表页勾选图片 → 单张下载或「批量下载 (zip)」

## 在线官网

GitHub Pages 部署：https://IrisChen5102.github.io/img-picker/
