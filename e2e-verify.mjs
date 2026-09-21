/**
 * 浏览器端到端验证脚本（任务「验证要求」）
 *
 * 用法：
 *   1. npm run build
 *   2. node e2e-verify.mjs
 *
 * 覆盖：
 *   A. 五个路由均可访问
 *   B. 筛选写入 URL 查询状态；进入系列页后浏览器返回恢复筛选
 *   C. 灯箱接收当前结果集，上一张/下一张只在该集合内循环
 *   D. 图片按真实 width/height 预留比例（加载前后无布局位移）
 *   E. 窄屏单列、说明落到底部；灯箱说明切换为底部信息条
 *   F. 字体本地加载，无 fonts.googleapis.com / fonts.gstatic.com 请求
 *   G. 联系表单：行内错误、无效时禁用提交、成功反馈状态
 */
import { spawn } from "node:child_process";
import process from "node:process";
import { chromium } from "@playwright/test";

const PORT = 4173;
const HOST = "127.0.0.1";
const BASE = `http://${HOST}:${PORT}`;

let failures = 0;
function check(name, ok, detail = "") {
  const mark = ok ? "PASS" : "FAIL";
  if (!ok) failures++;
  console.log(`[${mark}] ${name}${detail ? ` — ${detail}` : ""}`);
}

function waitForServer(url, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    const tick = async () => {
      try {
        const res = await fetch(url);
        if (res.ok) return resolve();
      } catch {
        /* server not up yet */
      }
      if (Date.now() > deadline) return reject(new Error("server timeout"));
      setTimeout(tick, 200);
    };
    tick();
  });
}

const server = spawn(
  "node",
  [
    "node_modules/vite/bin/vite.js",
    "preview",
    "--host",
    HOST,
    "--port",
    String(PORT),
    "--strictPort",
  ],
  {
    stdio: "ignore",
  },
);

// 父进程退出时确保关闭静态服务器，避免端口残留
const cleanup = () => {
  try {
    server.kill();
  } catch {
    /* ignore */
  }
  process.exit();
};
process.on("exit", cleanup);
process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);

async function run() {
  await waitForServer(BASE);
  const browser = await chromium.launch();

  // ---------------------------------------------------------------
  // A. 五个路由
  // ---------------------------------------------------------------
  {
    const page = await browser.newPage();
    const routes = [
      ["/", "Lin Zhao"],
      ["/work", "Work"],
      ["/work/gaze", "凝视"],
      ["/work/wilderness", "无人之境"],
      ["/work/highland-pastoral", "高原牧歌"],
      ["/about", "About"],
      ["/contact", "Contact"],
    ];
    for (const [path, keyword] of routes) {
      await page.goto(BASE + path);
      const body = await page.locator("body").innerText();
      check(`路由 ${path} 可访问且包含「${keyword}」`, body.includes(keyword));
    }
    await page.close();
  }

  // ---------------------------------------------------------------
  // B. 筛选写入 URL；浏览器返回恢复筛选
  // ---------------------------------------------------------------
  {
    const page = await browser.newPage();
    await page.goto(BASE + "/work");
    await page.getByRole("button", { name: "牧野", exact: true }).click();
    await page.waitForURL(/\?category=pastoral$/);
    check("筛选牧野后 URL 写入 ?category=pastoral", true, page.url());

    const cardCount = await page.locator(".photo-card").count();
    check("牧野结果集为 4 张照片", cardCount === 4, `实际 ${cardCount}`);

    // 进入系列详情页
    await page.locator(".filter-bar__series-link").click();
    await page.waitForURL(/\/work\/highland-pastoral/);
    check("进入系列详情页 /work/highland-pastoral", true, page.url());

    // 浏览器返回
    await page.goBack();
    await page.waitForURL(/\?category=pastoral$/);
    const activeFilter = await page
      .locator(".filter-pill--active")
      .innerText();
    const restoredCount = await page.locator(".photo-card").count();
    check(
      "浏览器返回后筛选恢复为牧野（URL + 激活按钮 + 4 张）",
      activeFilter.trim() === "牧野" && restoredCount === 4,
      `按钮=${activeFilter} 数量=${restoredCount}`,
    );
    await page.close();
  }

  // ---------------------------------------------------------------
  // C. 灯箱只在当前结果集内循环
  // ---------------------------------------------------------------
  {
    const page = await browser.newPage();
    await page.goto(BASE + "/work?category=pastoral");
    await page.locator(".photo-card__frame").first().click();
    await page.waitForSelector(".lightbox[open], .lightbox");

    const position = async () =>
      (await page.locator(".lightbox__position").innerText()).trim();

    check("灯箱打开时位置为 1 / 4", (await position()) === "1 / 4", await position());

    // 上一张：在集合内循环，应从 1 跳到 4
    await page.keyboard.press("ArrowLeft");
    check("集合内循环：第 1 张按上一张到第 4 张", (await position()) === "4 / 4", await position());
    await page.keyboard.press("ArrowRight");
    check("再按下一张回到第 1 张", (await position()) === "1 / 4", await position());

    // 连按 4 次下一张应回到原位（证明只在 4 张内循环，不会跑到其他分类）
    for (let i = 0; i < 4; i++) await page.keyboard.press("ArrowRight");
    check("连按 4 次下一张回到 1 / 4（边界内循环）", (await position()) === "1 / 4", await position());

    // 灯箱标题/说明存在
    const title = await page.locator(".lightbox__title").innerText();
    const caption = await page.locator(".lightbox__caption").innerText();
    check("灯箱显示照片标题与说明", title.length > 0 && caption.length > 0, `${title} / ${caption.slice(0, 12)}…`);

    // Esc 关闭
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);
    const lightboxGone = await page.locator(".lightbox").count();
    check("Esc 关闭灯箱", lightboxGone === 0);
    await page.close();
  }

  // ---------------------------------------------------------------
  // D. 图片按真实宽高比预留，加载无 CLS
  // ---------------------------------------------------------------
  {
    const page = await browser.newPage();
    const requests = [];
    page.on("request", (req) => {
      if (req.resourceType() === "image") requests.push(new URL(req.url()).pathname);
    });

    await page.goto(BASE + "/work", { waitUntil: "commit" });
    // 在图片尚未完成加载时，img 已带 width/height/aspect-ratio，占位空间已撑开
    await page.waitForSelector(".photo-card__img");
    const reserved = await page.$$eval(".photo-card__img", (imgs) =>
      imgs.slice(0, 6).map((img) => {
        const el = img;
        const ratio = el.style.aspectRatio;
        const hasDims = el.getAttribute("width") && el.getAttribute("height");
        const box = el.getBoundingClientRect();
        return { ratio, hasDims: Boolean(hasDims), h: Math.round(box.height) };
      }),
    );
    const allReserved = reserved.every(
      (r) => r.hasDims && /\d+ \/ \d+/.test(r.ratio) && r.h > 100,
    );
    check(
      "图片加载前已按 width/height 撑开比例空间",
      allReserved,
      JSON.stringify(reserved[0]),
    );

    // 监听布局位移
    let cls = 0;
    await page.addInitScript(() => {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          window.__cls = (window.__cls || 0) + entry.value;
        }
      }).observe({ type: "layout-shift", buffered: true });
    });
    await page.goto(BASE + "/work");
    await page.waitForLoadState("networkidle");
    cls = await page.evaluate(() => window.__cls || 0);
    check("图片加载完成后网格布局位移≈0（CLS）", cls < 0.05, `CLS=${cls.toFixed(4)}`);
    await page.close();
  }

  // ---------------------------------------------------------------
  // E. 移动端：单列 + 说明落底部；灯箱底部信息条
  // ---------------------------------------------------------------
  {
    const page = await browser.newPage({
      viewport: { width: 390, height: 844 },
    });
    await page.goto(BASE + "/work?category=portrait");
    const columns = await page
      .locator(".photo-grid")
      .evaluate((el) => getComputedStyle(el).columnCount);
    check("窄屏网格为单列", columns === "1", `column-count=${columns}`);

    // 说明在图片下方（静态定位，常显）而非悬浮 overlay
    const captionPos = await page
      .locator(".photo-card__caption").first()
      .evaluate((el) => getComputedStyle(el).position);
    const captionVisible = await page
      .locator(".photo-card__caption").first()
      .isVisible();
    check(
      "窄屏照片说明落到底部、常显（静态文档流）",
      captionPos === "static" && captionVisible,
      `position=${captionPos}`,
    );

    // 灯箱说明为底部信息条
    await page.locator(".photo-card__frame").first().click();
    await page.waitForTimeout(200);
    const infoPlacement = await page.locator(".lightbox__info").evaluate((el) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        cols: s.gridTemplateColumns.split(" ").length,
        bottomGap: Math.round(window.innerHeight - r.bottom),
      };
    });
    check(
      "窄屏灯箱说明为底部信息条（单列网格且贴底）",
      infoPlacement.cols === 1 && infoPlacement.bottomGap <= 2,
      JSON.stringify(infoPlacement),
    );
    await page.close();
  }

  // ---------------------------------------------------------------
  // F. 无外部字体请求
  // ---------------------------------------------------------------
  {
    const page = await browser.newPage();
    const externalFontRequests = [];
    page.on("request", (req) => {
      const url = req.url();
      if (
        url.includes("fonts.googleapis.com") ||
        url.includes("fonts.gstatic.com")
      ) {
        externalFontRequests.push(url);
      }
    });
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    await page.goto(BASE + "/work", { waitUntil: "networkidle" });

    const fontUrls = await page.evaluate(async () => {
      const fonts = await document.fonts.ready;
      return [...fonts].map((f) => `${f.family} ${f.weight} ${f.style}`);
    });
    const localFontsLoaded = fontUrls.some((f) => f.includes("Playfair")) &&
      fontUrls.some((f) => f.includes("Inter"));
    check(
      "字体全部本地加载，无 Google Fonts 请求",
      externalFontRequests.length === 0 && localFontsLoaded,
      `外部请求=${externalFontRequests.length}; 已加载=${[...new Set(fontUrls.map((f) => f.split(" ").slice(0, 2).join(" ")))].join(" | ")}`,
    );
    await page.close();
  }

  // ---------------------------------------------------------------
  // G. 联系表单状态
  // ---------------------------------------------------------------
  {
    const page = await browser.newPage();
    await page.goto(BASE + "/contact");

    const submit = page.locator('button[type="submit"]');
    const nameInput = page.locator("#contact-name");
    const emailInput = page.locator("#contact-email");
    const messageInput = page.locator("#contact-message");

    // 初始：按钮禁用
    check("空表单提交按钮禁用", (await submit.isDisabled()) === true);

    // 邮箱格式错误：行内错误 + 仍禁用
    await nameInput.fill("张三");
    await emailInput.fill("not-an-email");
    await messageInput.fill("这是一条足够长的合作留言，用来触发校验。");
    await emailInput.blur();
    const emailError = await page.locator("#contact-email-error").count();
    check("非法邮箱显示行内错误", emailError === 1);
    check("存在错误时提交按钮保持禁用", (await submit.isDisabled()) === true);

    // 修正后启用
    await emailInput.fill("zhang@example.com");
    await emailInput.blur();
    check("校验通过后提交按钮启用", (await submit.isDisabled()) === false);

    // 提交 → 成功状态
    await submit.click();
    await page.waitForSelector(".contact-success", { timeout: 5000 });
    const successText = await page.locator(".contact-success").innerText();
    check(
      "提交后显示明确成功反馈（原表单消失）",
      successText.includes("Message sent") &&
        (await page.locator(".contact-form").count()) === 0,
    );
    await page.close();
  }

  await browser.close();
}

run()
  .catch((err) => {
    console.error(err);
    failures++;
  })
  .finally(() => {
    server.kill();
    console.log(`\n${failures === 0 ? "全部验证通过 ✅" : `有 ${failures} 项失败 ❌`}`);
    process.exit(failures === 0 ? 0 : 1);
  });
