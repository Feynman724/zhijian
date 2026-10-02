import { scenario } from "./scenario.js?v=1";

const feed = document.querySelector("#feed");
const outputContent = document.querySelector("#output-content");
const analysisState = document.querySelector("#analysis-state");
const playButton = document.querySelector("#play-demo");
const stepLabel = document.querySelector("#step-label");
const stepProgress = document.querySelector("#step-progress");
const stageProgress = document.querySelector("#stage-progress");
const demoModeButton = document.querySelector("#demo-mode");

let currentStep = 0;
let playing = false;
let timer = null;
let demoMode = true;

const escapeHtml = (value = "") => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");

function activeStage() {
  if (!currentStep) return 0;
  return scenario.events[Math.min(currentStep - 1, scenario.events.length - 1)].stage;
}

function renderMessage(event, index) {
  const mentionBody = escapeHtml(event.body).replaceAll("@织见机器人", '<mark>@织见机器人</mark>');
  const extras = event.type === "voice" ? `<div class="voice-wave"><button type="button" aria-label="播放语音">▶</button><span>${Array.from({ length: 28 }, (_, i) => `<i style="height:${6 + ((i * 7 + index * 5) % 18)}px"></i>`).join("")}</span></div>` : event.type === "file" ? `<div class="file-preview"><b>PDF</b><span><strong>${escapeHtml(event.title)}</strong><small>用户研究 · 已提取重点</small></span></div>` : "";
  return `<article class="message ${escapeHtml(event.type)}" style="--delay:${index * 35}ms">
    <div class="message-meta"><time>${escapeHtml(event.time)}</time><span>${escapeHtml(event.source)}</span></div>
    <span class="avatar ${escapeHtml(event.tone)}">${escapeHtml(event.initials)}</span>
    <div class="message-card"><header><strong>${escapeHtml(event.author)}</strong><span>${escapeHtml(event.title)}</span></header><p>${mentionBody}</p>${extras}</div>
  </article>`;
}

function outputIcon(type) {
  return ({ topic: "?", consensus: "✓", dispute: "↔", snapshot: "✦", loading: "", proposal: "✦", evidence: "↳", confirmed: "✓", archive: "⌕", record: "▤", metric: "%", alert: "!", review: "!" })[type] ?? "•";
}

function renderOutput(output, index, isLatest) {
  const classes = ["output-card", output.type, isLatest ? "latest" : ""].filter(Boolean).join(" ");
  const icon = output.type === "loading" ? `<span class="spinner"></span>` : `<span class="output-icon">${outputIcon(output.type)}</span>`;
  return `<article class="${classes}" style="--delay:${index * 45}ms"><header>${icon}<span><small>${escapeHtml(output.label)}</small><strong>${escapeHtml(output.title)}</strong></span></header><p>${escapeHtml(output.body)}</p>${output.type === "confirmed" || output.type === "record" || output.type === "review" ? `<button type="button">查看完整档案 →</button>` : ""}</article>`;
}

function renderEmpty() {
  feed.innerHTML = `<div class="empty-feed"><span>⌁</span><strong>准备开始讨论</strong><p>消息出现时，AI 会在右侧同步整理。</p></div>`;
  outputContent.innerHTML = `<div class="empty-output"><span>✦</span><strong>等待讨论开始</strong><p>AI 会识别议题、共识、分歧和需要跟进的决定。</p></div>`;
}

function render() {
  const stage = activeStage();
  const stageData = scenario.stages[stage];
  document.querySelector("#scenario-label").textContent = scenario.label;
  document.querySelector("#scenario-title").textContent = scenario.title;
  document.querySelector("#scenario-question").textContent = scenario.question;
  document.querySelector("#discussion-title").textContent = scenario.title;
  document.querySelector(".sidebar footer .avatar").textContent = scenario.presenterInitial;
  document.querySelector(".sidebar footer strong").textContent = scenario.presenter;
  document.querySelector("#stage-eyebrow").textContent = stageData.eyebrow;
  document.querySelector("#stage-title").textContent = stageData.title;
  document.querySelector("#speaker-note").textContent = stageData.note;
  document.querySelector("#time-label").textContent = stage === 2 ? "三天后" : "今天 09:02";

  document.querySelectorAll("[data-stage]").forEach((button) => button.classList.toggle("active", Number(button.dataset.stage) === stage));
  stageProgress.style.width = `${((stage + 1) / scenario.stages.length) * 100}%`;
  stepLabel.textContent = `${currentStep} / ${scenario.events.length}`;
  stepProgress.style.width = `${(currentStep / scenario.events.length) * 100}%`;

  if (!currentStep) {
    renderEmpty();
    analysisState.innerHTML = `<i></i> 等待讨论`;
    return;
  }

  const revealed = scenario.events.slice(0, currentStep);
  const feedEvents = demoMode ? revealed.filter((event) => event.stage === stage) : revealed;
  feed.innerHTML = `${stage === 2 ? `<div class="day-break"><span>三天后</span><i></i></div>` : ""}${feedEvents.map(renderMessage).join("")}`;
  feed.scrollTop = feed.scrollHeight;

  const stageOutputs = revealed.filter((event) => event.stage === stage && event.output).map((event) => event.output);
  outputContent.innerHTML = stageOutputs.map((output, index) => renderOutput(output, index, index === stageOutputs.length - 1)).join("");
  outputContent.scrollTop = outputContent.scrollHeight;
  const latest = revealed.at(-1);
  analysisState.classList.toggle("working", latest?.output?.type === "loading");
  analysisState.innerHTML = latest?.output?.type === "loading" ? `<i></i> 正在分析…` : `<i></i> 已同步更新`;
}

function setStep(value) {
  currentStep = Math.max(0, Math.min(scenario.events.length, value));
  render();
  if (currentStep === scenario.events.length) pause("重新播放");
}

function play() {
  if (currentStep === scenario.events.length) currentStep = 0;
  playing = true;
  playButton.textContent = "暂停";
  playButton.classList.add("active");
  clearInterval(timer);
  timer = window.setInterval(() => {
    if (currentStep >= scenario.events.length) return pause("重新播放");
    setStep(currentStep + 1);
  }, 1800);
  setStep(currentStep + 1);
}

function pause(label = "继续播放") {
  playing = false;
  clearInterval(timer);
  timer = null;
  playButton.textContent = label;
  playButton.classList.remove("active");
}

function togglePlay() {
  if (playing) pause(); else play();
}

playButton.addEventListener("click", togglePlay);
document.querySelector("#prev-step").addEventListener("click", () => { pause(); setStep(currentStep - 1); });
document.querySelector("#next-step").addEventListener("click", () => { pause(); setStep(currentStep + 1); });
document.querySelector("#restart-demo").addEventListener("click", () => { pause("开始演示"); setStep(0); });
demoModeButton.addEventListener("click", () => { demoMode = !demoMode; document.body.classList.toggle("demo-mode", demoMode); demoModeButton.classList.toggle("active", demoMode); render(); });
document.querySelectorAll("[data-stage]").forEach((button) => button.addEventListener("click", () => {
  pause();
  const stage = Number(button.dataset.stage);
  const first = scenario.events.findIndex((event) => event.stage === stage);
  setStep(first + 1);
}));
document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") { event.preventDefault(); pause(); setStep(currentStep + 1); }
  if (event.key === "ArrowLeft") { event.preventDefault(); pause(); setStep(currentStep - 1); }
  if (event.key === " ") { event.preventDefault(); togglePlay(); }
});

document.body.classList.add("demo-mode");
demoModeButton.classList.add("active");
render();
