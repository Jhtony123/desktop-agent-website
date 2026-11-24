# Desktop Agent Website

[Desktop Agent](https://desktopagent.dev) 官网单页站点。纯静态实现，零构建、零依赖、无 CDN 引用。

## 在线预览

- 自托管：`http://<your-server-ip>/`（部署在自己的服务器上，地址不公开写入仓库）
- 开启 GitHub Pages 后：`https://<username>.github.io/<repo>/`

## 快速开始

```bash
git clone https://github.com/Jhtony123/desktop-agent-website.git
cd desktop-agent-website
python3 -m http.server 8848 --bind 127.0.0.1
# 打开 http://127.0.0.1:8848/
```

不要直接双击 `index.html`：`file://` 下浏览器会拦截部分行为，截图与字体表现和线上不一致。

## 目录结构

```
desktop-agent-website/
├── index.html              单页站点（11 个语义化 section）
├── tutorial.html           使用教程页（四章 + 左侧粘性目录）
├── styles.css              全部样式（设计 token 内联在 :root）
├── tutorial.css            教程页专属样式（复用 styles.css 的 token）
├── main.js                 原生 JS 交互
├── tutorial.js             教程页交互（目录高亮 / 平滑滚动 / 回顶）
└── assets/
    ├── app-screenshot.png  应用界面截图（Hero 主视觉）
    └── favicon.svg         站点图标
```

## 页面结构

| 段落 | 内容 |
|---|---|
| Hero | 一句话价值主张 + 双 CTA + 应用截图（仿 macOS 窗口框） |
| 能力 Bento | 6 格不等宽网格，含终端打字演示 |
| 数据条 | 4 个数字滚动卡 |
| 架构 | L5 Shell → L1 Infra 五层堆叠图 |
| 技能分层 | L0–L3 渐进加载表格 |
| Harness | 结构化提示 / 错误软介入 / 上下文压缩 |
| Prompt 缓存 | 三类提示块 + 命中率对比 + 厂商协议对照 |
| 模型层 | 本地模型支持（Ollama / llama.cpp / OpenAI 兼容）+ 三槽位分工 |
| 亮点功能 | 微信通道 · 插件系统 · 定时任务 · 实时语音 |
| 场景 | 6 条真实使用场景 |
| 设计系统 | 16 色可点击复制色卡 + token 代码块 |
| 下载 | 单网盘目录（macOS / Windows 同文件夹）+ 新手教程入口 |

## 设计语言（2026-11 重设计）

**浅色企业风**：白 / 淡灰紫底 + 珊瑚红品牌色 + 深蓝紫深色治理段 + 悬浮卡片柔和投影。信息架构为价值叙事：定位 slogan → 三步工作法 → 能力 Bento → 产品实拍 Tabs → 可靠执行（深色段）→ 数据条 → 场景 → 宣传片 → 下载。

| 角色 | 值 |
|---|---|
| 品牌主色 | `--brand: #E8442E`（珊瑚红） |
| 页面底 / 卡片面 / 次级面 | `#F7F8FC` / `#FFFFFF` / `#F1F2F9` |
| 深色段渐变 | `#17123A → #2B2470 → #3B2E8F` + 点阵纹理 |
| 描边 | `--line: #E5E8F2` |
| 主 / 次 / 弱文字 | `#12142B` / `#3D4360` / `#767D99` |
| 辅色 | indigo `#4F46E5` · violet `#7C3AED` · cyan `#0EA5E9` · emerald `#10B981` · amber `#F59E0B` |
| 主 CTA | 珊瑚红渐变 + 柔和彩色投影 |

旧版 Cyber Dark + Acid 样式保留为 `legacy.css`，仅供 `tutorial.html` 使用。

## 宣传视频

`assets/promo-v1.mp4`（44s，1920×1080，9 镜头口播 + 代码合成配乐），由 `promo-video/` Remotion 工程渲染：

```bash
cd promo-video
npx remotion studio          # 预览
npx remotion render Promo out/promo.mp4
```

口播 TTS 与时间轴脚本在 `promo-video/scripts/`；`promo-video/` 不入公开仓库（见 .gitignore）。

字体走系统本地栈（`PingFang SC` / `Segoe UI` / `Cascadia Mono`），**刻意不引 Google Fonts** —— 境内加载会阻塞首屏渲染。

## 健壮性设计

- **无 JS 也全可见**：滚动揭示动画仅在 `<html class="js">` 下生效（该类由 head 内联脚本同步打上）。脚本被拦截或加载失败时内容照常显示，不会整页空白。
- **`prefers-reduced-motion`**：关闭全部过渡与打字动画，直接呈现终态。
- **打印样式**：强制揭示元素可见并隐藏背景光效。
- **响应式断点**：`1000px`（Bento 6→4 列、架构层单列）、`720px`（汉堡菜单、单列）。
- **中文断词**：关键双字词组用 `.nw` 包裹，避免「可/复用」这类跨行拆开。

## 部署

任意静态托管均可（Nginx / Caddy / GitHub Pages / Vercel / OSS+CDN）。

Nginx 参考配置要点：

```nginx
root  /var/www/desktop-agent;
index index.html;
charset utf-8;

# HTML/CSS/JS 不缓存，便于随时更新
location = /index.html { add_header Cache-Control "no-cache, must-revalidate"; }
location = /styles.css { add_header Cache-Control "no-cache, must-revalidate"; }
location = /main.js    { add_header Cache-Control "no-cache, must-revalidate"; }

# 图片长期缓存；换图请改文件名
location /assets/ { expires 30d; add_header Cache-Control "public, max-age=2592000"; }

# 关闭目录列表 + 拦截点文件
location ~ /\. { deny all; }

gzip on;
gzip_types text/css application/javascript image/svg+xml;
```

`gzip` 对 CSS 收益显著：38 KB → 8.5 KB（省约 78%）。

## 更新站点

本地改完 `scp` 覆盖对应文件即可，无需重启 Nginx（HTML/CSS/JS 是 `no-cache`）。
`assets/` 为 30 天强缓存，替换图片时请改文件名。

## License

页面文案与视觉设计版权归原作者所有。代码部分可自由参考学习。
