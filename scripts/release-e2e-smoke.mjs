import { spawn } from "node:child_process";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:5188";
const CHROME = process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const port = Number(process.env.CDP_PORT || 9455);
const profile = path.join(process.cwd(), `.release-smoke-profile-${Date.now()}`);

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

function textIssues(text) {
  const issues = [];
  for (const marker of ["â", "Â", "Ã", "�"]) {
    if (text.includes(marker)) issues.push(`mojibake marker ${marker}`);
  }
  if (/\bundefined\b/i.test(text)) issues.push("visible undefined");
  if (/\bNaN\b/.test(text)) issues.push("visible NaN");
  return issues;
}

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
      consoleIssues.push(msg.params?.exceptionDetails?.text ?? "exception");
    }
    if (
      msg.method === "Log.entryAdded" &&
      ["error", "warning"].includes(msg.params?.entry?.level)
    ) {
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

  const target = await send("Target.createTarget", { url: "about:blank" }, undefined);
  sessionId = (
    await send("Target.attachToTarget", { targetId: target.targetId, flatten: true }, undefined)
  ).sessionId;
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Log.enable");
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1365,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

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
    const deadline = Date.now() + 15000;
    while (Date.now() < deadline) {
      const ready = await evalPage(
        `document.readyState !== 'loading' && document.body && document.body.innerText.length > 60`,
      ).catch(() => false);
      if (ready) return;
      await sleep(250);
    }
    throw new Error(`Route did not render: ${route}`);
  };

  const clickButton = async (label) => {
    const result = await evalPage(`(() => {
      const visible = (e) => {
        const r = e.getBoundingClientRect();
        const s = getComputedStyle(e);
        return !e.disabled && s.display !== 'none' && s.visibility !== 'hidden' && r.width > 0 && r.height > 0;
      };
      const buttons = Array.from(document.querySelectorAll('button')).filter((b) => visible(b) && (b.innerText || '').trim() === ${JSON.stringify(label)});
      if (!buttons.length) return false;
      buttons[0].click();
      return true;
    })()`);
    if (!result) throw new Error(`Button not found: ${label}`);
    await sleep(500);
  };

  const routes = [
    ["/", "Start Selection"],
    ["/wizard/project", "Project & Line Data"],
    ["/wizard/conditions", "Service Conditions"],
    ["/wizard/function", "Valve Function"],
    ["/wizard/type", "Valve Type"],
    ["/wizard/materials", "RATING BASIS"],
    ["/wizard/ends", "End Connection"],
    ["/wizard/special", "Special Service"],
    ["/report", "Recommendation Report"],
    ["/reports", "Report Library"],
    ["/saved", "Saved Selections"],
    ["/references", "Reference Library"],
    ["/manual", "User Manual"],
    ["/settings", "Settings"],
    ["/about", "About"],
    ["/release", "Release Notes"],
    ["/terms", "Terms of Use"],
    ["/privacy", "Privacy Policy"],
  ];

  const failures = [];
  for (const [route, expected] of routes) {
    await goto(route);
    const metrics = await evalPage(`(() => {
      const text = document.body.innerText;
      return {
        route: location.pathname,
        hasExpected: text.toLowerCase().includes(${JSON.stringify(expected.toLowerCase())}),
        overflow: document.documentElement.scrollWidth > innerWidth + 2,
        issues: (${textIssues.toString()})(text)
      };
    })()`);
    if (!metrics.hasExpected || metrics.overflow || metrics.issues.length) failures.push(metrics);
  }

  await goto("/wizard/project");
  await evalPage("localStorage.clear()");
  await goto("/wizard/project");
  await clickButton("Load Sample Data");
  await goto("/report");
  const report = await evalPage(`(() => {
    const text = document.body.innerText;
    return {
      hasRecommendation: text.includes('Recommended'),
      hasAsmeGroup: text.toLowerCase().includes('asme material group'),
      hasB165: text.toLowerCase().includes('b16.5 rating table'),
      hasB1634: text.toLowerCase().includes('b16.34 body basis') || text.includes('ASME B16.34 body check'),
      hasGovernance: text.includes('Engineering Decision Support Tool') && text.includes('qualified reviewing engineer'),
      issues: (${textIssues.toString()})(text)
    };
  })()`);
  if (
    !report.hasRecommendation ||
    !report.hasAsmeGroup ||
    !report.hasB165 ||
    !report.hasB1634 ||
    !report.hasGovernance ||
    report.issues.length
  ) {
    failures.push({ route: "/report", report });
  }

  if (failures.length) {
    console.error(JSON.stringify({ ok: false, failures, consoleIssues }, null, 2));
    process.exitCode = 1;
  } else {
    console.log(JSON.stringify({ ok: true, routeCount: routes.length, consoleIssues }, null, 2));
  }

  await send("Browser.close", {}, null).catch(() => {});
} finally {
  await sleep(500);
  await rm(profile, { recursive: true, force: true }).catch(() => {});
}
