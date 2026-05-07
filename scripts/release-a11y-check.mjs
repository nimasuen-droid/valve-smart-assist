import { spawn } from "node:child_process";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:5188";
const CHROME = process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const port = Number(process.env.A11Y_CDP_PORT || 9465);
const profile = path.join(process.cwd(), `.release-smoke-profile-a11y-${Date.now()}`);

const routes = [
  "/",
  "/wizard/project",
  "/wizard/conditions",
  "/wizard/function",
  "/wizard/type",
  "/wizard/materials",
  "/wizard/ends",
  "/wizard/sizing",
  "/wizard/special",
  "/report",
  "/saved",
  "/references",
  "/manual",
  "/settings",
  "/about",
  "/release",
  "/eula",
  "/terms",
  "/privacy",
];

const viewports = [
  { name: "desktop", width: 1365, height: 900, mobile: false, deviceScaleFactor: 1 },
  { name: "mobile", width: 390, height: 844, mobile: true, deviceScaleFactor: 2 },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function json(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.json();
}

async function waitForCdp() {
  const deadline = Date.now() + 15000;
  let last;
  while (Date.now() < deadline) {
    try {
      return await json(`http://127.0.0.1:${port}/json/version`);
    } catch (error) {
      last = error;
      await sleep(250);
    }
  }
  throw last ?? new Error("Chrome did not expose CDP.");
}

const auditFunction = () => {
  const issues = [];
  const visible = (el) => {
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      Number(style.opacity) > 0
    );
  };
  const nameOf = (el) =>
    (
      el.getAttribute("aria-label") ||
      (el.getAttribute("aria-labelledby")
        ? el
            .getAttribute("aria-labelledby")
            .split(/\s+/)
            .map((id) => document.getElementById(id)?.innerText || "")
            .join(" ")
        : "") ||
      (el.id ? document.querySelector(`label[for="${CSS.escape(el.id)}"]`)?.innerText : "") ||
      el.closest("label")?.innerText ||
      el.getAttribute("title") ||
      el.innerText ||
      el.textContent ||
      ""
    ).trim();
  const selectorOf = (el) => {
    const tag = el.tagName.toLowerCase();
    const id = el.id ? `#${el.id}` : "";
    const text = nameOf(el).slice(0, 50);
    return `${tag}${id}${text ? ` "${text}"` : ""}`;
  };
  const fail = (rule, message, el) =>
    issues.push({ rule, message, selector: el ? selectorOf(el) : undefined });

  if (!document.documentElement.lang) fail("html-lang", "Document must declare a language.");
  if (!document.title.trim()) fail("document-title", "Document must have a non-empty title.");
  if (!document.querySelector("main")) fail("main-landmark", "Page must include a main landmark.");
  const h1s = [...document.querySelectorAll("h1")].filter(visible);
  if (h1s.length !== 1)
    fail("page-heading", `Expected exactly one visible h1, found ${h1s.length}.`);

  const ids = new Map();
  for (const el of [...document.querySelectorAll("[id]")].filter(visible)) {
    ids.set(el.id, (ids.get(el.id) || 0) + 1);
  }
  for (const [id, count] of ids) {
    if (count > 1) fail("duplicate-id", `Duplicate id "${id}" appears ${count} times.`);
  }

  for (const el of document.querySelectorAll("button, a[href], [role='button'], [role='link']")) {
    if (visible(el) && !nameOf(el))
      fail("accessible-name", "Interactive element needs an accessible name.", el);
  }

  for (const el of document.querySelectorAll("input:not([type='hidden']), select, textarea")) {
    if (!visible(el)) continue;
    if (
      el.getAttribute("aria-hidden") === "true" ||
      el.closest("[aria-hidden='true']") ||
      el.hasAttribute("hidden") ||
      el.getAttribute("tabindex") === "-1"
    ) {
      continue;
    }
    const id = el.id;
    const hasLabel = !!(
      el.getAttribute("aria-label") ||
      el.getAttribute("aria-labelledby") ||
      (id && document.querySelector(`label[for="${CSS.escape(id)}"]`)) ||
      el.closest("label")
    );
    if (!hasLabel) fail("form-label", "Form control needs a programmatic label.", el);
  }

  for (const img of document.querySelectorAll("img")) {
    if (visible(img) && !img.hasAttribute("alt"))
      fail("image-alt", "Visible image must include alt text.", img);
  }

  for (const el of document.querySelectorAll("[tabindex]")) {
    const value = Number(el.getAttribute("tabindex"));
    if (value > 0) fail("tabindex", "Avoid positive tabindex values.", el);
  }

  for (const el of document.querySelectorAll("[aria-hidden='true']")) {
    if (
      el.querySelector("button, a[href], input, select, textarea, [tabindex]:not([tabindex='-1'])")
    ) {
      fail("aria-hidden-focus", "aria-hidden region must not contain focusable controls.", el);
    }
  }

  if (document.documentElement.scrollWidth > innerWidth + 2) {
    fail(
      "horizontal-overflow",
      `Page overflows horizontally: ${document.documentElement.scrollWidth}px > ${innerWidth}px.`,
    );
  }

  const srgb = (channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const luminance = ([r, g, b]) => 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
  const contrast = (fg, bg) => {
    const l1 = luminance(fg);
    const l2 = luminance(bg);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };
  const parseRgb = (value) => {
    const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([.\d]+))?\)/);
    if (!match) return null;
    return [
      Number(match[1]),
      Number(match[2]),
      Number(match[3]),
      match[4] === undefined ? 1 : Number(match[4]),
    ];
  };
  const backgroundOf = (el) => {
    let cur = el;
    while (cur && cur !== document.documentElement) {
      const bg = parseRgb(getComputedStyle(cur).backgroundColor);
      if (bg && bg[3] > 0.95) return bg;
      cur = cur.parentElement;
    }
    return parseRgb(getComputedStyle(document.body).backgroundColor) || [255, 255, 255, 1];
  };

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const contrastIssues = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const text = node.nodeValue.replace(/\s+/g, " ").trim();
    if (!text) continue;
    const el = node.parentElement;
    if (!el || !visible(el)) continue;
    const style = getComputedStyle(el);
    const fg = parseRgb(style.color);
    const bg = backgroundOf(el);
    if (!fg || !bg) continue;
    const ratio = contrast(fg, bg);
    const fontSize = parseFloat(style.fontSize);
    const fontWeight = Number(style.fontWeight) || (style.fontWeight === "bold" ? 700 : 400);
    const isLarge = fontSize >= 24 || (fontSize >= 18.66 && fontWeight >= 700);
    const required = isLarge ? 3 : 4.5;
    if (ratio < required) {
      contrastIssues.push({
        rule: "color-contrast",
        message: `Text contrast ${ratio.toFixed(2)} is below ${required}:1 for "${text.slice(0, 80)}".`,
        selector: selectorOf(el),
      });
    }
  }
  issues.push(...contrastIssues.slice(0, 12));
  if (contrastIssues.length > 12) {
    fail("color-contrast", `${contrastIssues.length - 12} additional contrast issues omitted.`);
  }

  return {
    title: document.title,
    h1: h1s[0]?.innerText || "",
    issueCount: issues.length,
    issues,
  };
};

await mkdir(profile, { recursive: true });
spawn(
  CHROME,
  [
    "--headless=new",
    "--disable-gpu",
    "--disable-extensions",
    "--no-first-run",
    "--no-default-browser-check",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    "about:blank",
  ],
  { stdio: "ignore" },
);

let ws;
let sessionId;
try {
  const version = await waitForCdp();
  ws = new WebSocket(version.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", reject, { once: true });
  });

  let id = 0;
  const pending = new Map();
  const consoleIssues = [];
  ws.addEventListener("message", (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result ?? {});
      return;
    }
    if (msg.method === "Runtime.exceptionThrown") {
      consoleIssues.push(
        msg.params?.exceptionDetails?.exception?.description ??
          msg.params?.exceptionDetails?.text ??
          "exception",
      );
    }
    if (msg.method === "Log.entryAdded" && msg.params?.entry?.level === "error") {
      consoleIssues.push(msg.params.entry.text);
    }
  });

  const send = (method, params = {}, sid = sessionId) => {
    const call = { id: ++id, method, params };
    if (sid) call.sessionId = sid;
    ws.send(JSON.stringify(call));
    return new Promise((resolve, reject) => {
      pending.set(call.id, { resolve, reject });
      setTimeout(() => {
        if (pending.has(call.id)) {
          pending.delete(call.id);
          reject(new Error(`Timed out: ${method}`));
        }
      }, 30000);
    });
  };

  const target = await send("Target.createTarget", { url: "about:blank" }, null);
  sessionId = (
    await send("Target.attachToTarget", { targetId: target.targetId, flatten: true }, null)
  ).sessionId;
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Log.enable");

  const evalPage = async (expression) => {
    const result = await send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result?.value;
  };

  const goto = async (route) => {
    await send("Page.navigate", { url: `${BASE_URL}${route}` });
    const deadline = Date.now() + 20000;
    while (Date.now() < deadline) {
      const ready = await evalPage(
        `document.readyState !== 'loading' && document.querySelector('main') && document.body.innerText.length > 40`,
      ).catch(() => false);
      if (ready) return;
      await sleep(250);
    }
    throw new Error(`Route did not render: ${route}`);
  };

  const failures = [];
  for (const viewport of viewports) {
    await send("Emulation.setDeviceMetricsOverride", viewport);
    for (const route of routes) {
      await goto(route);
      const result = await evalPage(`(${auditFunction.toString()})()`);
      if (result.issueCount) failures.push({ viewport: viewport.name, route, ...result });
    }
  }

  if (failures.length || consoleIssues.length) {
    console.error(
      JSON.stringify(
        {
          ok: false,
          auditedRoutes: routes.length,
          auditedViewports: viewports.map((v) => v.name),
          failureCount: failures.length,
          failures,
          consoleIssues,
        },
        null,
        2,
      ),
    );
    process.exitCode = 1;
  } else {
    console.log(
      JSON.stringify(
        {
          ok: true,
          auditedRoutes: routes.length,
          auditedViewports: viewports.map((v) => v.name),
          consoleIssues,
        },
        null,
        2,
      ),
    );
  }

  await send("Browser.close", {}, null).catch(() => {});
} finally {
  await sleep(500);
  await rm(profile, { recursive: true, force: true }).catch(() => {});
}
