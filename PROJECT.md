# Lin Zhao — Photography Portfolio

离线可用的独立摄影师作品集：React + TypeScript + Vite，五个路由 + 一个全局灯箱组件。

## 运行

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # 类型检查 + 生产构建
npm run preview   # 预览生产构建
```

## 浏览器端到端验证

```bash
npm run build
node e2e-verify.mjs
```

脚本会自行启动静态服务器并用 Playwright(Chromium)验证：五个路由、筛选写入 URL 与浏览器返回恢复、灯箱仅在当前结果集内循环、图片按真实宽高比预留（CLS≈0）、移动端单列与底部信息条、无外部字体请求、联系表单的错误/成功状态。

## 架构要点

- `src/data/photos.ts` 是**唯一照片数据层**：所有页面与灯箱都通过它读取 `src/data/photos.json`（原样复制自 `mock-data/photos.json`，未做任何修改）。系列页不另写照片列表。
- `/work` 的分类筛选保存在 URL 查询串（`?category=portrait|landscape|pastoral`）中。进入系列详情页后点浏览器返回，历史条目携带原查询串，筛选原样恢复。
- 灯箱是全局共享组件（`src/lightbox/`），通过 Context 打开；打开时接收**当前结果集**与索引，←/→ 循环严格限定在该集合内（例如筛选“牧野”后只在 4 张牧野照片间循环）。
- `AspectImage` 用每张照片真实的 `width`/`height` 设置 `aspect-ratio` 与 `<img width height>`，图片加载前即撑开正确比例，避免布局抖动。
- 桌面端为 CSS columns masonry；窄屏（≤680px）切换为单列，照片标题/分类落到图片下方常显，灯箱说明由侧边信息栏切换为底部信息条。
- 字体全部本地托管在 `public/fonts/`：Inter、Playfair Display 由 `assets/fonts/` 提供；业务数据中的中文（仅 `photos.json` 的系列名、标题、说明）使用按数据实际用字子集化的 Noto Sans SC（约 45KB/字重）。页面 UI 文案为英文，与字体规范一致。构建中不存在任何 `fonts.googleapis.com` / `fonts.gstatic.com` 请求。
- `/contact` 为纯前端表单：行内校验提示、校验未通过禁用提交按钮、发送中状态与成功反馈页（前端 `setTimeout` 模拟，无后端）。

## 目录

```
public/fonts/        本地字体（Inter / Playfair Display / Noto Sans SC 子集）
public/photos/       14 张照片（复制自 mock-data/photos/）
src/data/            统一照片数据层 + 原始 photos.json
src/components/      Header / Footer / AspectImage / PhotoCard / ScrollToTop
src/lightbox/        全局灯箱（Context + Portal 组件）
src/pages/           Home / Work / Series / About / Contact / NotFound
e2e-verify.mjs       Playwright 交互验证脚本
```
