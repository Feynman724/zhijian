import { getParticipant, meetingOutputs, meetingSessions, participants, seedDecisions, seedEvents } from "./data.js?v=20260929-3";

if ("scrollRestoration" in history) history.scrollRestoration = "manual";
window.scrollTo(0, 0);

const messageList = document.querySelector("#message-list");
const messageScroll = document.querySelector("#message-scroll");
const timelineView = document.querySelector("#timeline-view");
const decisionsView = document.querySelector("#decisions-view");
const decisionPage = document.querySelector("#decision-page");
const decisionDetail = document.querySelector("#decision-detail");
const decisionSidebar = document.querySelector("#decision-sidebar");
const viewTitle = document.querySelector("#view-title");
const viewSubtitle = document.querySelector("#view-subtitle");
const searchInput = document.querySelector("#search-input");
const composer = document.querySelector("#composer");
const composerInput = document.querySelector("#composer-input");
const mentionButton = document.querySelector("#mention-button");
const uploadButton = document.querySelector("#upload-button");
const fileInput = document.querySelector("#file-input");
const recordButton = document.querySelector("#record-button");
const recordLabel = document.querySelector("#record-label");
const apiDialog = document.querySelector("#api-dialog");
const exportDialog = document.querySelector("#export-dialog");
const exportPreview = document.querySelector("#export-preview");
const toastRegion = document.querySelector("#toast-region");

let events = structuredClone(seedEvents);
let decisions = structuredClone(seedDecisions);
let activeDecisionId = decisions[0].id;
let activeOutputType = "decision";
let currentView = "timeline";
let searchTerm = "";
let exportFormat = "markdown";
let mediaRecorder = null;
let recordingStream = null;
let audioChunks = [];
let recordingStartedAt = 0;
let voiceDiscussionActive = false;

const originLabels = { chat: "产品方向群", meeting: "线上会议", offline: "线下讨论" };

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function nowLabel() {
  return new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function nextMinute() {
  return Math.max(...events.map((event) => Number(event.minute) || 0), 0) + 1;
}

function eventById(id) {
  return events.find((event) => event.id === id);
}

function sourceLabel(id) {
  const item = eventById(id);
  if (!item) return "来源不可用";
  return `${item.page ? `P.${item.page} · ` : ""}${item.title}`;
}

function sourceChips(sources = []) {
  if (!sources.length) return "";
  return `<div class="source-list">${sources.map((id) => `<button class="source-chip" type="button" data-source="${escapeHtml(id)}"><span>↗</span><span>${escapeHtml(sourceLabel(id))}</span></button>`).join("")}</div>`;
}

function participantMarkup(event) {
  const person = getParticipant(event.participantId);
  return `<span class="person-avatar ${escapeHtml(person.color)}">${escapeHtml(person.initials)}</span>`;
}

function highlightMentions(text) {
  return escapeHtml(text).replaceAll("@织见机器人", '<span class="mention">@织见机器人</span>');
}

function waveform(seed) {
  return Array.from({ length: 34 }, (_, index) => `<i style="height:${5 + ((index * 7 + seed * 5) % 17)}px"></i>`).join("");
}

function renderAttachment(event) {
  if (event.modality === "voice") {
    return `<div class="voice-bubble"><button class="play-button" type="button" data-action="play-audio" data-event-id="${escapeHtml(event.id)}" aria-label="播放语音">▶</button><div class="waveform" aria-hidden="true">${waveform(event.id.length)}</div><span class="voice-duration">${escapeHtml(event.duration ?? "00:18")}</span></div>`;
  }
  if (event.modality === "file") {
    return `<div class="file-card"><span class="file-type">${event.page ? "PDF" : "FILE"}</span><span><strong>${escapeHtml(event.title)}</strong><small>${escapeHtml(event.meta ?? "讨论文件")}</small></span><p class="file-excerpt">${escapeHtml(event.body)}</p></div>`;
  }
  if (event.modality === "image" && event.previewUrl) {
    return `<div class="image-card"><img src="${escapeHtml(event.previewUrl)}" alt="${escapeHtml(event.title)}" /></div>`;
  }
  if (event.modality === "image" && event.imageKind !== "whiteboard") {
    return `<div class="image-card funnel-card"><div class="funnel-title"><strong>${escapeHtml(event.title)}</strong><small>内部测试 · 样本 100</small></div><div class="funnel-bars"><div><b>100</b><span>收到邀请</span></div><div><b>62</b><span>打开网页</span></div><div><b>28</b><span>完成讨论</span></div></div></div>`;
  }
  return "";
}

function eventKind(event) {
  if (event.type === "bot") return "bot";
  if (event.modality === "decision") return "decision";
  return "human";
}

function originFor(event) {
  if (event.type === "bot") return "机器人";
  if (event.modality === "decision") return "决策事件";
  return originLabels[event.channel] ?? "讨论";
}

function renderTimelineEvent(event) {
  const person = getParticipant(event.participantId);
  const kind = eventKind(event);
  const reply = event.replyTo ? `<div class="reply-quote">回复 ${escapeHtml(sourceLabel(event.replyTo))}</div>` : "";
  let content;

  if (kind === "decision") {
    content = `<div class="system-decision"><strong>✓ ${escapeHtml(event.title)} · ${escapeHtml(event.decisionId)}</strong><p>${escapeHtml(event.body)}</p></div>`;
  } else {
    const botActions = kind === "bot" && event.decisionId
      ? `<div class="bot-actions"><button class="mini-button primary" type="button" data-action="open-decision" data-decision-id="${escapeHtml(event.decisionId)}">查看结构化决策</button><button class="mini-button" type="button" data-action="open-export">导出上下文</button></div>`
      : kind === "bot" && event.tags?.includes("export-ready")
        ? `<div class="bot-actions"><button class="mini-button primary" type="button" data-action="open-export">选择格式并导出</button></div>` : "";
    content = `<div class="timeline-card ${kind === "bot" ? "bot-card" : ""}">
      <div class="entry-head">${participantMarkup(event)}<span><strong>${escapeHtml(person.name)}</strong><small>${event.location ? `${escapeHtml(event.location)} · ` : ""}${escapeHtml(event.title)}</small></span><span class="origin-badge">${escapeHtml(originFor(event))}</span></div>
      ${reply}<p class="entry-body">${highlightMentions(event.transcript ?? event.body ?? "")}</p>${renderAttachment(event)}${sourceChips(event.sources)}${botActions}
    </div>`;
  }

  return `<article class="timeline-entry" id="event-${escapeHtml(event.id)}" data-channel="${escapeHtml(event.channel)}" data-kind="${kind}">
    <div class="timeline-meta"><time>${escapeHtml(event.time)}</time><span><i class="source-dot ${kind === "bot" ? "bot" : escapeHtml(event.channel)}"></i>${escapeHtml(originFor(event))}</span></div>
    <span class="timeline-node" aria-hidden="true"></span>${content}
  </article>`;
}

function renderDiscussionSession() {
  const session = meetingSessions[0];
  const names = session.participantIds.map((id) => getParticipant(id).name).join("、");
  return `<section class="discussion-session" id="session-${escapeHtml(session.id)}">
    <div class="session-kicker"><span class="session-live-dot"></span><span>线上语音讨论</span><time>${escapeHtml(session.startTime)}–${escapeHtml(session.endTime)}</time></div>
    <div class="session-main"><div><strong>${escapeHtml(session.title)}</strong><p>${escapeHtml(session.agenda)}</p></div><button type="button" data-action="play-session">▶ 回放 12 分钟</button></div>
    <div class="session-footer"><span>${escapeHtml(names)}</span><span>自动转写已进入讨论空间</span></div>
  </section>`;
}

function matchesSearch(event) {
  if (!searchTerm) return true;
  const person = getParticipant(event.participantId);
  return [event.title, event.body, event.transcript, event.location, person.name, originFor(event), ...(event.tags ?? [])].join(" ").toLocaleLowerCase("zh-CN").includes(searchTerm);
}

function renderTimeline() {
  const visible = [...events].sort((a, b) => a.minute - b.minute).filter(matchesSearch);
  let sessionInserted = false;
  const timelineHtml = visible.map((event) => {
    const shouldInsert = !sessionInserted && event.minute >= meetingSessions[0].minute && (!searchTerm || event.channel === "meeting");
    if (!shouldInsert) return renderTimelineEvent(event);
    sessionInserted = true;
    return `${renderDiscussionSession()}${renderTimelineEvent(event)}`;
  }).join("");
  messageList.innerHTML = visible.length ? timelineHtml : `<div class="dialog-note">没有找到相关讨论。</div>`;
  const counter = document.querySelector('.nav-item[data-view="timeline"] b');
  if (counter) counter.textContent = events.length;
}

function renderDecisionDetail() {
  const item = decisions.find((decision) => decision.id === activeDecisionId) ?? decisions[0];
  if (!item) return;
  const list = (values = []) => `<ul>${values.map((value) => `<li>${escapeHtml(value)}</li>`).join("")}</ul>`;
  const selector = `<div class="output-selector">
    <button class="${activeOutputType === "decision" ? "active" : ""}" type="button" data-output-section="decision"><strong>结论</strong><small>2 项已确认</small></button>
    <button class="${activeOutputType === "actions" ? "active" : ""}" type="button" data-output-section="actions"><strong>行动项</strong><small>${meetingOutputs.actions.length} 项待跟进</small></button>
    <button class="${activeOutputType === "debate" ? "active" : ""}" type="button" data-output-section="debate"><strong>分歧</strong><small>观点与依据</small></button>
  </div><div class="output-detected"><span>AI 识别</span><strong>${escapeHtml(meetingOutputs.detectedType)}</strong><small>根据实际讨论生成，可人工修改</small></div>`;

  if (activeOutputType === "actions") {
    decisionDetail.innerHTML = `${selector}<section class="output-heading"><span class="decision-id">ACTION ITEMS</span><h2>谁在什么时候前做什么</h2><p>从讨论中的承诺、负责人和时间要求自动整理。</p></section>
      <div class="action-list">${meetingOutputs.actions.map((action) => `<article class="action-card"><div class="action-person"><span>${escapeHtml(action.owner.slice(0, 1))}</span><strong>${escapeHtml(action.owner)}</strong><small class="${action.status === "已完成" ? "done" : ""}">${escapeHtml(action.status)}</small></div><p>${escapeHtml(action.task)}</p><div class="action-due"><span>截止时间</span><strong>${escapeHtml(action.due)}</strong></div>${sourceChips(action.sources)}</article>`).join("")}</div>`;
    return;
  }

  if (activeOutputType === "debate") {
    decisionDetail.innerHTML = `${selector}<section class="output-heading"><span class="decision-id">VIEWPOINTS</span><h2>${escapeHtml(meetingOutputs.debate.question)}</h2><p>保留双方观点及其依据，避免总结只剩一个结论。</p></section>
      <div class="viewpoint-list">${meetingOutputs.debate.sides.map((side, index) => `<article class="viewpoint-card"><div><span>观点 ${index + 1}</span><strong>${escapeHtml(side.label)}</strong><small>${escapeHtml(side.speaker)}</small></div><p>${escapeHtml(side.body)}</p>${sourceChips(side.sources)}</article>`).join("")}</div>
      <section class="resolution-card"><small>当前处理方式</small><strong>${escapeHtml(meetingOutputs.debate.resolution)}</strong>${sourceChips(meetingOutputs.debate.sources)}</section>`;
    return;
  }

  decisionDetail.innerHTML = `${selector}<div class="decision-tabs">${decisions.map((decision) => `<button class="${decision.id === item.id ? "active" : ""}" type="button" data-decision-id="${escapeHtml(decision.id)}"><strong>${escapeHtml(decision.id)}</strong><small>${escapeHtml(decision.title)}</small></button>`).join("")}</div>
    <section class="decision-heading"><div class="decision-id-row"><span class="decision-id">${escapeHtml(item.id)}</span><span class="status-pill">已确认</span></div><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.body)}</p></section>
    <div class="decision-meta-grid"><div><small>负责人</small><strong>${escapeHtml(item.owner)}</strong></div><div><small>完成期限</small><strong>${escapeHtml(item.dueDate)}</strong></div><div><small>确认成员</small><strong>${item.confirmedBy.length} / 3</strong></div><div><small>最后更新</small><strong>${escapeHtml(item.time)}</strong></div></div>
    <section class="decision-section"><strong>主要依据</strong>${sourceChips(item.evidence)}</section>
    <section class="decision-section"><strong>保留的反方意见</strong>${list(item.opposition)}</section>
    <section class="decision-section"><strong>成立条件</strong>${list(item.conditions)}</section>
    <section class="decision-section"><strong>复核触发器</strong>${list(item.reviewTriggers)}</section>`;
}

function renderDecisionPage() {
  const visible = decisions.filter((item) => {
    if (!searchTerm) return true;
    return [item.id, item.title, item.body, item.owner, item.status, ...(item.conditions ?? []), ...(item.reviewTriggers ?? [])]
      .join(" ")
      .toLocaleLowerCase("zh-CN")
      .includes(searchTerm);
  });
  decisionPage.innerHTML = `<div class="decision-page-header"><small>DISCUSSION OUTPUT</small><h1>讨论产出</h1><p>根据讨论类型生成真正会被使用的结论、行动项和分歧记录。</p></div>
    <div class="output-overview"><button type="button" data-output-section="decision"><span>01</span><strong>结论</strong><small>2 项已确认决策</small></button><button type="button" data-output-section="actions"><span>02</span><strong>行动项</strong><small>${meetingOutputs.actions.length} 项负责人和期限</small></button><button type="button" data-output-section="debate"><span>03</span><strong>分歧与依据</strong><small>${meetingOutputs.debate.sides.length} 组观点已保留</small></button></div>
    <h2 class="decision-table-title">已确认决策</h2>
    <div class="decision-table"><div class="decision-row header"><span>编号</span><span>决策</span><span>状态</span><span>负责人</span><span>更新时间</span></div>${visible.length ? visible.map((item) => `<button class="decision-row" type="button" data-decision-id="${escapeHtml(item.id)}"><strong>${escapeHtml(item.id)}</strong><span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.body)}</small></span><span class="status-pill">已确认</span><span>${escapeHtml(item.owner)}</span><span>${escapeHtml(item.time)}</span></button>`).join("") : `<div class="decision-empty">没有找到相关决策。</div>`}</div>`;
}

function switchView(view) {
  currentView = view;
  const timelineActive = view === "timeline";
  timelineView.hidden = !timelineActive;
  decisionsView.hidden = timelineActive;
  document.querySelectorAll(".nav-item[data-view]").forEach((button) => button.classList.toggle("active", button.dataset.view === view));
  viewTitle.textContent = timelineActive ? "产品方向讨论" : "讨论产出";
  viewSubtitle.textContent = timelineActive ? "群聊、线上会议与线下讨论 · 同一个讨论空间" : "结论、行动项与分歧 · 都能回到原始讨论";
  searchInput.placeholder = timelineActive ? "搜索全部上下文" : "搜索决策";
  if (timelineActive) renderTimeline(); else renderDecisionPage();
}

function focusSource(id) {
  searchTerm = "";
  searchInput.value = "";
  switchView("timeline");
  requestAnimationFrame(() => {
    const target = document.querySelector(`#event-${CSS.escape(id)}`);
    if (!target) return;
    messageScroll.scrollTop = Math.max(0, target.offsetTop - 100);
    target.classList.add("source-focus");
    window.setTimeout(() => target.classList.remove("source-focus"), 1800);
  });
}

function openDecision(id) {
  if (!decisions.some((item) => item.id === id)) return;
  activeDecisionId = id;
  activeOutputType = "decision";
  renderDecisionDetail();
  decisionSidebar.classList.add("open");
}

function openOutput(type) {
  if (!["decision", "actions", "debate"].includes(type)) return;
  activeOutputType = type;
  renderDecisionDetail();
  decisionSidebar.classList.add("open");
}

function appendEvent(event) {
  events.push({ participantId: "lupin", channel: "chat", time: nowLabel(), minute: nextMinute(), tags: [], ...event });
  switchView("timeline");
  requestAnimationFrame(() => { messageScroll.scrollTop = messageScroll.scrollHeight; });
}

function botReplyFor(text) {
  if (/导出|Markdown|JSON|另一个模型/.test(text)) {
    return { title: "可移植上下文已就绪", body: `已整理 ${events.length} 条上下文和 ${decisions.length} 项结构化决策。你可以选择 Markdown 或 JSON，交给任意支持长文本输入的模型。`, sources: ["text-brief", "voice-criteria", "offline-whiteboard", "decision-confirmed"], tags: ["ai", "export-ready"] };
  }
  if (/决策|结论|整理/.test(text)) {
    return { title: "决策候选", body: "结合群聊、线上会议和线下讨论，当前已形成的核心决策是：第一版聚焦统一时间线与结构化决策；AI 通过群内 @ 参与，并保持供应商中立。", sources: ["voice-criteria", "meeting-opposition", "offline-whiteboard", "text-condition"], decisionId: "D-001", tags: ["ai", "decision-proposal"] };
  }
  return { title: "上下文回答", body: "我已经同时读取群聊、线上会议和线下讨论。当前未解决的问题是如何在不增加录入负担的前提下，稳定采集线下讨论。", sources: ["file-interviews", "offline-whiteboard"], tags: ["ai", "answer"] };
}

function submitMessage() {
  const body = composerInput.value.trim();
  if (!body) return;
  appendEvent({ id: `message-${Date.now()}`, type: "message", modality: "text", title: body.includes("@织见机器人") ? "调用机器人" : "群聊消息", body, tags: ["user-added"] });
  composerInput.value = "";
  composerInput.style.height = "auto";
  if (body.includes("@织见机器人")) {
    const reply = botReplyFor(body);
    window.setTimeout(() => {
      appendEvent({ id: `bot-${Date.now()}`, type: "bot", modality: "ai", participantId: "ai", title: reply.title, body: reply.body, sources: reply.sources, decisionId: reply.decisionId, tags: reply.tags });
    }, 360);
  }
}

function buildPortableContext() {
  return {
    schema: "loom-context/v1",
    exportedAt: new Date().toISOString(),
    topic: "产品方向讨论",
    participants: participants.filter((item) => item.id !== "ai").map(({ id, name }) => ({ id, name })),
    events: [...events].sort((a, b) => a.minute - b.minute).map((event) => ({ id: event.id, time: event.time, source: event.channel, author: getParticipant(event.participantId).name, type: event.type, content: event.transcript ?? event.body, references: event.sources ?? [], decisionId: event.decisionId ?? null })),
    decisions,
  };
}

function markdownContext() {
  const portable = buildPortableContext();
  const lines = [`# ${portable.topic}`, "", `导出时间：${portable.exportedAt}`, "", "## 参与成员", ...portable.participants.map((item) => `- ${item.name}`), "", "## 讨论时间线"];
  portable.events.forEach((event) => { lines.push("", `### ${event.time} · ${originLabels[event.source] ?? "系统"} · ${event.author}`, event.content ?? "", event.references.length ? `来源引用：${event.references.join(", ")}` : ""); });
  lines.push("", "## 结构化决策");
  decisions.forEach((item) => { lines.push("", `### ${item.id} · ${item.title}`, item.body, `- 状态：已确认`, `- 负责人：${item.owner}`, `- 成立条件：${item.conditions.join("；")}`, `- 复核触发：${item.reviewTriggers.join("；")}`, `- 来源：${item.sources.join(", ")}`); });
  return lines.filter((line) => line !== undefined).join("\n");
}

function currentExportText() {
  return exportFormat === "json" ? JSON.stringify(buildPortableContext(), null, 2) : markdownContext();
}

function updateExportPreview() {
  exportPreview.textContent = currentExportText();
}

function openExport() {
  updateExportPreview();
  exportDialog.showModal();
}

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(reader.error); reader.readAsDataURL(file); });
}

async function appendFile(file) {
  const base = { id: `upload-${Date.now()}`, title: file.name, meta: `${file.type || "未知格式"} · ${(file.size / 1024).toFixed(1)} KB`, tags: ["user-added"] };
  if (file.type.startsWith("image/")) return appendEvent({ ...base, type: "image", modality: "image", previewUrl: await readAsDataUrl(file), body: "分享了一张图片" });
  if (file.type.startsWith("audio/")) return appendEvent({ ...base, type: "voice", modality: "voice", audioUrl: URL.createObjectURL(file), duration: "本地音频", transcript: "上传了一段语音。生产版本会在这里显示实时转写。" });
  let body = "分享了一个文件";
  if (/text|csv|markdown/.test(file.type) || /\.(txt|md|csv)$/i.test(file.name)) body = (await file.text()).slice(0, 520) || body;
  appendEvent({ ...base, type: "file", modality: "file", body });
}

async function toggleRecording() {
  if (mediaRecorder?.state === "recording") return mediaRecorder.stop();
  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) return showToast("当前浏览器不支持网页录音。", 3200);
  try {
    recordingStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioChunks = [];
    recordingStartedAt = Date.now();
    mediaRecorder = new MediaRecorder(recordingStream);
    mediaRecorder.addEventListener("dataavailable", (event) => { if (event.data.size) audioChunks.push(event.data); });
    mediaRecorder.addEventListener("stop", () => {
      const blob = new Blob(audioChunks, { type: mediaRecorder.mimeType || "audio/webm" });
      const elapsed = Math.max(1, Math.round((Date.now() - recordingStartedAt) / 1000));
      appendEvent({ id: `recording-${Date.now()}`, type: "voice", modality: "voice", title: "语音消息", transcript: "录音已保存。生产版本会在这里显示实时转写。", audioUrl: URL.createObjectURL(blob), duration: `00:${String(elapsed).padStart(2, "0")}` });
      recordingStream?.getTracks().forEach((track) => track.stop());
      recordButton.classList.remove("recording"); recordLabel.textContent = "语音";
    });
    mediaRecorder.start(); recordButton.classList.add("recording"); recordLabel.textContent = "结束";
  } catch { recordButton.classList.remove("recording"); recordLabel.textContent = "语音"; showToast("未获得麦克风权限。", 3000); }
}

function playAudio(id, button) {
  const item = eventById(id);
  if (!item?.audioUrl) { button.textContent = "❚❚"; window.setTimeout(() => { button.textContent = "▶"; }, 1600); return; }
  const audio = new Audio(item.audioUrl); button.textContent = "❚❚"; audio.addEventListener("ended", () => { button.textContent = "▶"; }); audio.play().catch(() => { button.textContent = "▶"; });
}

function showToast(message, duration = 2600) {
  const toast = document.createElement("div"); toast.className = "toast"; toast.textContent = message; toastRegion.append(toast); window.setTimeout(() => toast.remove(), duration);
}

document.addEventListener("click", (event) => {
  const view = event.target.closest("[data-view]"); if (view) switchView(view.dataset.view);
  const source = event.target.closest("[data-source]"); if (source) focusSource(source.dataset.source);
  const outputSection = event.target.closest("[data-output-section]"); if (outputSection) openOutput(outputSection.dataset.outputSection);
  const decisionButton = event.target.closest("[data-decision-id]"); if (decisionButton) openDecision(decisionButton.dataset.decisionId);
  const action = event.target.closest("[data-action]");
  if (action?.dataset.action === "play-audio") playAudio(action.dataset.eventId, action);
  if (action?.dataset.action === "play-session") { action.textContent = action.textContent.includes("回放") ? "❚❚ 正在回放" : "▶ 回放 12 分钟"; showToast("正在回放本场语音讨论。", 1800); }
  if (action?.dataset.action === "open-decision") openDecision(action.dataset.decisionId);
  if (action?.dataset.action === "open-export") openExport();
  const format = event.target.closest("[data-format]");
  if (format) { exportFormat = format.dataset.format; document.querySelectorAll("[data-format]").forEach((button) => button.classList.toggle("active", button === format)); updateExportPreview(); }
});

searchInput.addEventListener("input", () => { searchTerm = searchInput.value.trim().toLocaleLowerCase("zh-CN"); if (currentView === "timeline") renderTimeline(); else renderDecisionPage(); });
composer.addEventListener("submit", (event) => { event.preventDefault(); submitMessage(); });
composerInput.addEventListener("input", () => { composerInput.style.height = "auto"; composerInput.style.height = `${Math.min(composerInput.scrollHeight, 116)}px`; });
composerInput.addEventListener("keydown", (event) => { if ((event.metaKey || event.ctrlKey) && event.key === "Enter") { event.preventDefault(); submitMessage(); } });
mentionButton.addEventListener("click", () => { const prefix = composerInput.value && !composerInput.value.endsWith(" ") ? " " : ""; composerInput.value += `${prefix}@织见机器人 `; composerInput.focus(); });
uploadButton.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", async () => { const [file] = fileInput.files; if (!file) return; try { await appendFile(file); showToast(`${file.name} 已加入时间线。`); } catch { showToast("文件读取失败。", 3000); } finally { fileInput.value = ""; } });
recordButton.addEventListener("click", toggleRecording);
document.querySelector("#api-button").addEventListener("click", () => apiDialog.showModal());
document.querySelector("#export-button").addEventListener("click", openExport);
document.querySelector("#decision-mobile-toggle").addEventListener("click", () => decisionSidebar.classList.add("open"));
document.querySelector("#close-decisions").addEventListener("click", () => decisionSidebar.classList.remove("open"));
document.querySelector("#voice-discussion-button").addEventListener("click", (event) => {
  voiceDiscussionActive = !voiceDiscussionActive;
  event.currentTarget.classList.toggle("active", voiceDiscussionActive);
  event.currentTarget.textContent = voiceDiscussionActive ? "结束语音讨论" : "开始语音讨论";
  showToast(voiceDiscussionActive ? "语音讨论已开始，转写会进入当前讨论空间。" : "语音讨论已结束，AI 正在整理本场产出。", 2600);
});
document.querySelector("#api-form").addEventListener("submit", (event) => { event.preventDefault(); const provider = document.querySelector("#provider-select").selectedOptions[0].textContent; document.querySelector("#key-input").value = ""; apiDialog.close(); showToast(`已切换为：${provider}`); });
document.querySelector("#copy-export").addEventListener("click", async () => { try { await navigator.clipboard.writeText(currentExportText()); showToast("上下文已复制。", 2200); } catch { showToast("浏览器未允许复制，请使用下载。", 3000); } });
document.querySelector("#download-export").addEventListener("click", () => { const extension = exportFormat === "json" ? "json" : "md"; const blob = new Blob([currentExportText()], { type: exportFormat === "json" ? "application/json" : "text/markdown" }); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `织见-产品方向讨论.${extension}`; anchor.click(); URL.revokeObjectURL(url); showToast("上下文文件已生成。", 2200); });

renderTimeline();
renderDecisionPage();
renderDecisionDetail();
