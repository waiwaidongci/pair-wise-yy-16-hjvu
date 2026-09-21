# 摄影师作品集（离线）

React + TypeScript + Vite 构建的独立摄影师作品集，暗色主题、本地字体、无外部 CDN 请求。

## 启动

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # 生产构建到 dist/
npm run preview  # 预览生产构建
```

## 浏览器实测

```bash
node e2e-verify.mjs     # 42 项断言，覆盖七条约束
```

（脚本依赖 `playwright`，已在 devDependencies 中；首次运行需 `npx playwright install chromium`。）

## 路由

| 路径 | 页面 |
|---|---|
| `/` | 首页：Hero 简介 + 三个系列精选入口 |
| `/work` | 作品集：全部 14 张照片、按分类筛选、masonry 网格 |
| `/work/:seriesId` | 系列详情：叙事式图文交替 + pull-quote |
| `/about` | 关于：简介与经历时间线 |
| `/contact` | 联系：带校验与成功反馈的表单 |

灯箱不是路由，是 `src/lightbox/` 下的全局共享组件（Context + 单例视图）。

## 关键设计：七条耦合约束如何落地

1. **筛选状态跨导航保持**：`/work` 的筛选不存页面 state，而是 URL 查询参数
   （`?category=pastoral`）。进入系列页后用浏览器返回，URL 被浏览器恢复，
   筛选自然还原；也因此可分享、可前进/后退。
2. **灯箱只在当前结果集内循环**：`LightboxContext.open(photos, startId)`
   显式接收「当前结果集」。`/work` 传筛选后的照片，系列页传该系列的照片，
   首页传精选封面；左右切换（含键盘 ←/→）只在该集合内取模循环。
3. **图片按真实比例占位（CLS）**：`SmartImage` 直接使用 photos.json 的
   `width`/`height` 写入 `aspect-ratio`，图片加载前容器尺寸已经确定；
   `<img width/height>` 与 onLoad 渐显配合。
4. **单一数据模型**：所有页面只通过 `src/data/photos.ts` 读取
   `mock-data/photos.json`（该文件原样未改），组件内不存在第二份照片列表。
5. **响应式形态切换（≤760px）**：`/work` 网格由 CSS columns 三列 masonry
   变为单列；卡片说明由 hover 浮层变为照片下方静态信息；灯箱说明由图片
   右侧浮层变为底部信息条（`flex-direction: column` + `position: static`）；
   导航折叠为汉堡菜单。
6. **字体完全离线**：`@font-face` 全部指向 `/fonts/*.woff2`
   （Inter、Playfair Display 及其中文回退 Noto Sans/Serif SC 子集），
   无 `fonts.googleapis.com` / `fonts.gstatic.com` 请求（实测拦截验证）。
7. **联系表单三态**：字段失焦后显示行内错误（空值 / 邮箱格式 / 留言长度），
   存在任何错误时提交按钮禁用；提交为前端模拟（900ms），成功后表单整体
   替换为带姓名、邮箱回显的成功状态，可一键再写一条。

## 目录

```
public/fonts/        本地 woff2 字体（构建一并打包）
public/photos/       照片静态资源（从 mock-data/photos 原样拷贝）
src/data/photos.ts   统一照片数据访问层（唯一数据出口）
src/lightbox/        全局灯箱：Context + 视图
src/components/      Layout、SmartImage、PhotoCard
src/pages/           Home / Work / Series / About / Contact
mock-data/photos.json  业务数据，保持原样，由 src 直接 import
```

> `assets/` 仅为视觉参考与字体来源，不参与运行时内容；
> 真实照片只存在于 `mock-data/` 与拷贝后的 `public/photos/`。
