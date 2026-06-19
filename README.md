# Zoom's Homepage

个人浏览器主页 / 新标签页，纯原生 HTML/CSS/JavaScript 构建，无构建系统、无包管理器。既可作为 **Chrome 扩展**加载（接管新标签页、离线可用），也可作为普通静态站点部署到 GitHub Pages。

## 功能

- 自定义搜索引擎切换（Google / 百度 / Bing / GitHub / B 站）
- 快捷方式管理（增删改查、拖拽排序、分页滚动、导入导出）
- 主题切换（亮色 / 暗色 / 跟随系统）
- 自定义背景图片（上传、模糊、透明度）
- 作为新标签页扩展：默认显示内置主页，也可在设置中重定向到任意网址

## 文件结构

| 文件 / 目录 | 用途 |
|------|------|
| `manifest.json` | Chrome 扩展配置（Manifest V3） |
| `index.html` | 内置主页入口（新标签页默认目标） |
| `newtab.html` | 新标签页重定向 shim，配合 `early.js` 防白闪 |
| `newtab.js` | 重定向逻辑：读 `chrome.storage.sync.targetUrl` 决定跳转目标 |
| `early.js` | 预加载脚本，重定向前隐藏文档防白闪 |
| `options.html` / `options.js` | 扩展设置页，配置新标签页目标网址 |
| `css/style.css` | 全部样式 |
| `js/main.js` | 主页全部应用逻辑 |
| `vendor/lucide.min.js` | Lucide 图标库（本地打包，满足扩展 MV3 CSP 且离线可用） |

## 作为 Chrome 扩展安装

1. 打开 `chrome://extensions/`
2. 开启右上角「开发者模式」
3. 点击「加载已解压的扩展程序」，选择**本仓库根目录**
4. 打开新标签页即生效

### 新标签页行为

- **未设置网址**（默认）→ 显示内置自定义主页（`index.html`）
- **在扩展设置页填入网址** → 新标签页重定向到该网址（沿用 DIY_homepage 行为）

> 扩展设置页打开方式：`chrome://extensions/` → 找到本扩展 → 「详细信息」→「扩展程序选项」。

## 关于主页按钮

Chrome 不允许扩展通过 `manifest.json` 把主页按钮指向扩展页面（`chrome_settings_overrides.homepage` 只能填静态 `https://` 网址）。如需让浏览器工具栏的「主页」按钮也指向内置主页，请在 Chrome 设置里手动配置：

设置 → 外观 → 显示主页按钮 → 自定义网址（可填本扩展的 Pages 地址或任意网址）。

## 作为静态站点部署

直接把 `index.html`、`css/`、`js/`、`vendor/` 推送到 GitHub Pages 等静态托管即可。扩展相关文件（`manifest.json`、`newtab.*`、`early.js`、`options.*`）放在站点根目录不影响页面访问，也可单独维护分支。

## 依赖

- **Lucide Icons**：已本地打包在 `vendor/lucide.min.js`（v0.344.0，ISC）。
- **Google Fonts**（Outfit + Noto Sans SC，国内镜像 `fonts.loli.net`）：在线加载，断网时自动回退系统无衬线字体。

## 数据存储

- 主页配置（主题、搜索引擎、快捷方式、背景）→ `localStorage`
- 新标签页重定向网址 → `chrome.storage.sync`（仅扩展模式生效）
