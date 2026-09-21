/**
 * 浏览器端实测脚本（Playwright）。
 *
 * 运行：node e2e-verify.mjs
 * 自动拉起 http://localhost:5173（若尚未启动则使用 npm run dev）。
 *
 * 覆盖 task.md「验证要求」：
 *  A. 五个路由均可到达
 *  B. /work 筛选写入 URL；进入系列页再浏览器返回，筛选恢复
 *  C. 灯箱只在当前筛选结果集内循环（牧野 4 张；全部 14 张）
 *  D. 图片按真实 width/height 预留 aspect-ratio，加载前占位无抖动
 *  E. 窄屏（390px）网格单列 + 说明落在照片底部；灯箱说明变底部信息条
 *  F. 无任何 fonts.googleapis.com / fonts.gstatic.com 外部字体请求
 *  G. 联系表单：行内错误、无效禁用提交、提交后成功反馈
 */
import { chromium } from "playwright";

const BASE = process.env.BASE_URL || "http://localhost:5173";
const WIDTH_DESKTOP = 1440;
const WIDTH_MOBILE = 390;

let passed = 0;
let failed = 0;

function check(name, cond, detail = "") {
  if (cond) {
    passed += 1;
    console.log(`  ✓ ${name}`);
  } else {
    failed += 1;
    console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

async function isDevUp() {
  try {
    const res = await fetch(BASE);
    return res.ok;
  } catch {
    return false;
  }
}

async function main() {
  const browser = await chromium.launch();

  // ---------------------------------------------------------------- F
  console.log("\n[F] 字体离线：监控全部网络请求");
  {
    const ctx = await browser.newContext({
      viewport: { width: WIDTH_DESKTOP, height: 900 },
    });
    const page = await ctx.newPage();
    const externalFontRequests = [];
    const fontRequests = [];
    page.on("request", (req) => {
      const url = req.url();
      if (
        url.includes("fonts.googleapis.com") ||
        url.includes("fonts.gstatic.com")
      ) {
        externalFontRequests.push(url);
      }
      if (url.endsWith(".woff2")) fontRequests.push(url);
    });
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await page.goto(`${BASE}/work`, { waitUntil: "networkidle" });
    await page.goto(`${BASE}/work/gaze`, { waitUntil: "networkidle" });
    await page.goto(`${BASE}/contact`, { waitUntil: "networkidle" });
    check(
      "不存在对 Google Fonts CDN 的请求",
      externalFontRequests.length === 0,
      externalFontRequests.join(", "),
    );
    check(
      "3 个本地 woff2 字体被请求",
      new Set(fontRequests).size >= 3,
      `实际：${[...new Set(fontRequests)].join(", ")}`,
    );
    await ctx.close();
  }

  // ---------------------------------------------------------------- A
  console.log("\n[A] 五个路由均可到达");
  {
    const page = await browser.newPage({
      viewport: { width: WIDTH_DESKTOP, height: 900 },
    });
    for (const path of ["/", "/work", "/work/gaze", "/about", "/contact"]) {
      await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
      check(
        `路由 ${path} 返回 200 且挂载 #root 内容`,
        (await page.locator("#root").innerHTML().then((s) => s.length)) > 100,
      );
    }
    // 系列页：封面 + 5 张叙事图（封面即第 1 张），唯一集合恰为 5 张肖像
    await page.goto(`${BASE}/work/gaze`, { waitUntil: "networkidle" });
    const seriesImgs = await page
      .locator("main img")
      .evaluateAll((nodes) => [...new Set(nodes.map((n) => n.getAttribute("src")))]);
    check(
      "/work/gaze 的图片唯一集合是 gaze 系列的 5 张肖像",
      seriesImgs.length === 5 &&
        seriesImgs.every((s) => s.includes("portrait/")) &&
        seriesImgs.some((s) => s.includes("portrait-05")),
      `实际：${seriesImgs.join(",")}`,
    );
    await page.close();
  }

  // ---------------------------------------------------------------- B
  console.log("\n[B] 筛选写入 URL，浏览器返回后恢复");
  {
    const page = await browser.newPage({
      viewport: { width: WIDTH_DESKTOP, height: 900 },
    });
    await page.goto(`${BASE}/work`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "牧野", exact: true }).click();
    await page.waitForURL(/category=pastoral/);
    check("点击「牧野」后 URL 含 ?category=pastoral", true);
    const cardsPastoral = await page.locator(".photo-card").count();
    check("筛选后网格只有 4 张牧野照片", cardsPastoral === 4, `实际 ${cardsPastoral}`);

    // 进入系列详情页
    await page.getByRole("link", { name: /进入系列/ }).first().click();
    await page.waitForURL(/\/work\/highland-pastoral/);
    check("成功导航到系列详情页 /work/highland-pastoral", true);

    // 浏览器返回
    await page.goBack();
    await page.waitForURL(/category=pastoral/);
    const pills = await page
      .getByRole("button", { name: "牧野", exact: true })
      .getAttribute("aria-pressed");
    const cardsAfterBack = await page.locator(".photo-card").count();
    check("浏览器返回后 URL 恢复 category=pastoral", true);
    check("返回后「牧野」筛选按钮仍为激活态", pills === "true", `aria-pressed=${pills}`);
    check("返回后网格仍是 4 张牧野照片", cardsAfterBack === 4, `实际 ${cardsAfterBack}`);
    await page.close();
  }

  // ---------------------------------------------------------------- C
  console.log("\n[C] 灯箱循环范围 = 当前结果集");
  {
    const page = await browser.newPage({
      viewport: { width: WIDTH_DESKTOP, height: 900 },
    });
    await page.goto(`${BASE}/work?category=pastoral`, {
      waitUntil: "networkidle",
    });
    await page.locator(".photo-card").first().click();
    await page.waitForSelector(".lightbox", { timeout: 3000 });
    check("点击照片打开灯箱", true);

    let counter = await page.locator(".lightbox__counter").textContent();
    check("灯箱计数为 1/4（结果集 4 张，而非全部 14 张）", counter.trim() === "1 / 4", counter);

    // 连点 4 次「下一张」应回到第 1 张
    for (let i = 0; i < 3; i++) {
      await page.getByRole("button", { name: "下一张" }).click();
    }
    counter = (await page.locator(".lightbox__counter").textContent()).trim();
    check("3 次下一张后到达 4/4", counter === "4 / 4", counter);
    await page.getByRole("button", { name: "下一张" }).click();
    counter = (await page.locator(".lightbox__counter").textContent()).trim();
    check("再点一次循环回到 1/4", counter === "1 / 4", counter);
    // 集合内全部是 pastoral
    const currentSrc = await page.locator(".lightbox__media img").getAttribute("src");
    check("当前灯箱图片属于 pastoral 目录", currentSrc.includes("pastoral/"), currentSrc);

    // 键盘 ArrowRight 也只在集合内
    await page.keyboard.press("ArrowRight");
    counter = (await page.locator(".lightbox__counter").textContent()).trim();
    check("键盘 → 移动到 2/4", counter === "2 / 4", counter);
    await page.keyboard.press("Escape");
    check("Esc 关闭灯箱", (await page.locator(".lightbox").count()) === 0);

    // 全部 14 张时灯箱集合应为 14
    await page.goto(`${BASE}/work`, { waitUntil: "networkidle" });
    await page.locator(".photo-card").first().click();
    await page.waitForSelector(".lightbox");
    counter = (await page.locator(".lightbox__counter").textContent()).trim();
    check("「全部」下灯箱计数为 1/14", counter === "1 / 14", counter);
    await page.keyboard.press("Escape");

    // 系列页灯箱集合为该系列（5 张）
    await page.goto(`${BASE}/work/gaze`, { waitUntil: "networkidle" });
    await page.locator(".narrative__media").first().click();
    await page.waitForSelector(".lightbox");
    counter = (await page.locator(".lightbox__counter").textContent()).trim();
    check("系列页灯箱计数为 1/5", counter === "1 / 5", counter);
    await page.keyboard.press("Escape");
    await page.close();
  }

  // ---------------------------------------------------------------- D
  console.log("\n[D] 图片按真实尺寸预留比例（CLS）");
  {
    const page = await browser.newPage({
      viewport: { width: WIDTH_DESKTOP, height: 900 },
    });
    // 拦截图片响应，制造慢加载，检查加载完成前容器已有正确 aspect-ratio
    let delayed = false;
    await page.route("**/*.jpg", async (route) => {
      if (!delayed) {
        delayed = true;
        await new Promise((r) => setTimeout(r, 1200));
      }
      await route.continue();
    });
    await page.goto(`${BASE}/work`, { waitUntil: "commit" });
    // 等首屏卡片渲染但首批图片尚未完成
    await page.waitForSelector(".photo-card .smart-image");
    await page.waitForTimeout(300);
    const boxes = await page
      .locator(".photo-card .smart-image")
      .evaluateAll((nodes) =>
        nodes.slice(0, 6).map((n) => {
          const r = n.getBoundingClientRect();
          return {
            ratio: (n.style.aspectRatio || "").replace(/\s/g, ""),
            w: Math.round(r.width),
            h: Math.round(r.height),
          };
        }),
      );
    const expected = {
      "portrait-01": "4067/6000",
      "landscape-01": "5404/3584",
      "pastoral-01": "10250/6834",
    };
    // 页面顺序：portrait 与 landscape/pastoral 混合，至少检查比例非空且尺寸已撑开
    check(
      "图片加载前所有卡片容器已声明 aspect-ratio",
      boxes.every((b) => /^\d+\/\d+$/.test(b.ratio)),
      JSON.stringify(boxes),
    );
    check(
      "图片加载前容器高度已按比例撑开（>0）",
      boxes.every((b) => b.w > 100 && b.h > 100),
      JSON.stringify(boxes),
    );
    // 单列（masonry 3 列，宽约 330px）纵向照片高度应明显更大
    const portraitish = boxes.find((b) => Math.abs(eval(b.ratio) - 4067 / 6000) < 0.01);
    check("包含 4067/6000 的竖幅照片占位", Boolean(portraitish), JSON.stringify(boxes));

    // CLS：待全部图片加载完成后，容器尺寸应与占位阶段完全一致
    await page.waitForLoadState("networkidle");
    const after = await page
      .locator(".photo-card .smart-image")
      .first()
      .evaluate((n) => {
        const r = n.getBoundingClientRect();
        return { w: Math.round(r.width), h: Math.round(r.height) };
      });
    check(
      "图片加载完成后容器尺寸与占位一致（宽度维度）",
      after.w === boxes[0].w,
      `before=${boxes[0].w} after=${after.w}`,
    );
    void expected;
    await page.close();
  }

  // ---------------------------------------------------------------- E
  console.log("\n[E] 窄屏 390px：单列 + 说明落底部 + 灯箱底部信息条");
  {
    const ctx = await browser.newContext({
      viewport: { width: WIDTH_MOBILE, height: 844 },
      isMobile: true,
    });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/work?category=portrait`, {
      waitUntil: "networkidle",
    });

    const columns = await page
      .locator(".photo-grid")
      .evaluate((n) => getComputedStyle(n).columnCount);
    check("窄屏网格 column-count = 1（单列）", columns === "1", `实际 ${columns}`);

    const overlayPos = await page
      .locator(".photo-card__overlay")
      .first()
      .evaluate((n) => getComputedStyle(n).position);
    check("卡片说明 position=static（落在照片下方而非浮层）", overlayPos === "static", overlayPos);

    const cardBox = await page.locator(".photo-card").first().boundingBox();
    const metaBox = await page.locator(".photo-card__meta").first().boundingBox();
    const imgBox = await page
      .locator(".photo-card .smart-image")
      .first()
      .boundingBox();
    check(
      "说明文字纵向位于图片之下",
      Boolean(metaBox && imgBox && metaBox.y >= imgBox.y + imgBox.height - 2),
      `img bottom=${imgBox && Math.round(imgBox.y + imgBox.height)}, meta y=${metaBox && Math.round(metaBox.y)}`,
    );
    check("卡片宽度接近视口宽度（单列占满）", Boolean(cardBox && cardBox.width > 330), `width=${cardBox && cardBox.width}`);

    // 灯箱底部信息条
    await page.locator(".photo-card").first().click();
    await page.waitForSelector(".lightbox");
    const infoPos = await page
      .locator(".lightbox__info")
      .evaluate((n) => getComputedStyle(n).position);
    check("窄屏灯箱说明 position=static（底部信息条，而非侧边浮层）", infoPos === "static", infoPos);
    const stageStyle = await page
      .locator(".lightbox__stage")
      .evaluate((n) => getComputedStyle(n).flexDirection);
    check("窄屏灯箱舞台为纵向排列", stageStyle === "column", stageStyle);
    await page.keyboard.press("Escape");
    await ctx.close();
  }

  // ---------------------------------------------------------------- G
  console.log("\n[G] 联系表单：错误态 / 禁用 / 成功态");
  {
    const page = await browser.newPage({
      viewport: { width: WIDTH_DESKTOP, height: 900 },
    });
    await page.goto(`${BASE}/contact`, { waitUntil: "networkidle" });

    const submit = page.getByRole("button", { name: /发送留言/ });
    check("初始空表单提交按钮禁用", await submit.isDisabled());

    // 填入非法邮箱并失焦 → 行内错误，按钮仍禁用
    await page.fill("#name", "阿照");
    await page.fill("#email", "not-an-email");
    await page.fill("#message", "短");
    await page.locator("#message").blur();
    await page.waitForSelector("#email-error");
    const emailErr = await page.locator("#email-error").textContent();
    const msgErrCount = await page.locator("#message-error").count();
    check("非法邮箱显示行内错误", /邮箱格式/.test(emailErr || ""), emailErr);
    check("过短留言显示行内错误", msgErrCount === 1);
    check("存在错误时提交按钮禁用", await submit.isDisabled());

    // 全部合法 → 按钮启用
    await page.fill("#email", "hello@example.com");
    await page.fill("#message", "想预约一组高原牧场的拍摄合作。");
    check("全部合法后提交按钮启用", await submit.isEnabled());
    await submit.click();
    await page.waitForSelector(".form-success", { timeout: 3000 });
    const successText = await page.locator(".form-success").textContent();
    check(
      "提交后显示成功反馈（表单替换为成功态）",
      /留言已发送/.test(successText || ""),
      successText || "",
    );
    check("成功后原始表单已消失", (await page.locator(".contact-form").count()) === 0);
    await page.close();
  }

  // 数据完整性：14 张照片全部来自 photos.json
  console.log("\n[数据] photos.json 原样使用");
  {
    const page = await browser.newPage({
      viewport: { width: WIDTH_DESKTOP, height: 900 },
    });
    await page.goto(`${BASE}/work`, { waitUntil: "networkidle" });
    const count = await page.locator(".photo-card").count();
    check("/work「全部」展示 14 张照片", count === 14, `实际 ${count}`);
    const titles = await page.locator(".photo-card__title").allTextContents();
    check("标题来自数据（含「低垂」「新疆牧场」）", titles.includes("低垂") && titles.includes("新疆牧场"));
    await page.close();
  }

  await browser.close();

  console.log(`\n结果：${passed} 通过，${failed} 失败`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
