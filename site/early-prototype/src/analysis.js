import { decisionSeed } from "./data.js";

const sourceExists = (events, id) => events.some((event) => event.id === id);

export function buildTimelineBlocks(events, meetingSessions = []) {
  const humanEvents = [...events]
    .filter((event) => ["chat", "meeting", "offline"].includes(event.channel))
    .sort((a, b) => (a.minute ?? 0) - (b.minute ?? 0));
  const blocks = [];

  for (const event of humanEvents) {
    if (event.channel === "meeting") {
      const previous = blocks.at(-1);
      if (previous?.type === "meeting" && previous.meetingId === event.meetingId) {
        previous.events.push(event);
        continue;
      }
      const session = meetingSessions.find((item) => item.id === event.meetingId) ?? {
        id: event.meetingId,
        title: "线上会议",
        platform: "会议",
        startTime: event.time,
        endTime: event.time,
        participantIds: [],
        agenda: "",
        summary: "",
      };
      blocks.push({ type: "meeting", meetingId: event.meetingId, session, events: [event] });
      continue;
    }

    if (event.channel === "offline") {
      const previous = blocks.at(-1);
      if (previous?.type === "offline") {
        previous.events.push(event);
      } else {
        blocks.push({ type: "offline", id: `offline-${event.id}`, events: [event] });
      }
      continue;
    }

    const previous = blocks.at(-1);
    if (previous?.type === "chat") {
      previous.events.push(event);
    } else {
      blocks.push({ type: "chat", id: `chat-${event.id}`, events: [event] });
    }
  }

  return blocks;
}

export function buildInsights(events) {
  const candidates = [
    {
      id: "insight-focus",
      kind: "focus",
      label: "核心问题",
      title: "真正需要对齐的是第一版的验证目标",
      body: "网页与小程序之争背后存在两套标准：验证产品价值强调开发速度，验证用户增长强调入口便利。",
      sources: ["text-brief", "voice-criteria"],
      accent: "violet",
    },
    {
      id: "insight-reasoning",
      kind: "reasoning",
      label: "跨模态关联",
      title: "访谈支持“微信是入口”，但没有证明必须先做小程序",
      body: "访谈文件描述的是沟通习惯；语音提案讨论的是验证速度。两者回答的是不同问题，不能直接互相否定。",
      sources: ["file-interviews", "voice-speed", "text-wechat"],
      accent: "blue",
    },
    {
      id: "insight-situation",
      kind: "situation",
      label: "条件性共识",
      title: "团队已同意先验证核心闭环，但入口风险仍未关闭",
      body: "当前共识依赖一个条件：网页跳转不能让大多数体验者在进入讨论前流失。",
      sources: ["image-funnel", "text-condition"],
      accent: "amber",
    },
    {
      id: "insight-options",
      kind: "options",
      label: "方案比较",
      title: "建议采用“网页验证 + 入口指标”路径",
      body: "它保留网页开发快的优势，同时把微信入口争议转化为可测量的重新评估条件。",
      sources: ["voice-speed", "image-funnel", "text-condition"],
      accent: "green",
      matrix: [
        ["独立网页", "验证速度高", "入口流失风险", "先执行"],
        ["微信小程序", "用户入口自然", "开发与审核成本", "满足触发条件后评估"],
      ],
    },
  ];

  return candidates
    .map((insight, index) => ({
      ...insight,
      type: "analysis",
      modality: "ai",
      participantId: "ai",
      time: `09:${20 + index}`,
      minute: 20 + index,
      sources: insight.sources.filter((id) => sourceExists(events, id)),
      tags: ["ai", insight.kind],
    }))
    .filter((insight) => insight.sources.length > 0);
}

export function buildCatchUp(events) {
  const hasDecision = events.some((event) => event.type === "decision");
  return {
    id: `catchup-${Date.now()}`,
    type: "catchup",
    modality: "ai",
    participantId: "ai",
    label: "上下文快照",
    title: "你离开后，讨论从入口选择转向验证目标",
    summary:
      "团队正在比较独立网页与微信小程序。当前倾向先用网页验证多模态时间线的核心价值，同时以体验完成率监控入口流失。",
    consensus: ["第一版需要先证明跨模态分析是否有用", "入口选择必须有量化指标"],
    openQuestions: ["体验完成率低于多少时应转向微信小程序？", "首轮测试需要覆盖多少个真实团队？"],
    sources: hasDecision
      ? ["decision-v1", "voice-criteria"]
      : ["voice-criteria", "text-condition"],
    time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
    minute: 98,
    tags: ["ai", "catch-up"],
  };
}

export function buildDecision(events) {
  const evidence = decisionSeed.evidence.filter((id) => sourceExists(events, id));
  const sources = decisionSeed.sources.filter((id) => sourceExists(events, id));

  return {
    ...decisionSeed,
    evidence,
    sources,
    time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
    minute: 96,
  };
}

export function evaluateDecision(decision, newEvent) {
  const normalized = `${newEvent.title ?? ""} ${newEvent.body ?? ""} ${(newEvent.tags ?? []).join(" ")}`;
  const challengesEntry = /拒绝|只愿意|流失|wechat-preference|微信内/.test(normalized);

  if (!challengesEntry) {
    return { ...decision, impactSources: [newEvent.id], impactMessage: "新信息已纳入，但尚未触发重新评估。" };
  }

  return {
    ...decision,
    status: "review",
    impactSources: [newEvent.id],
    impactMessage: "新证据直接影响“网页入口可接受”这一成立条件，建议重新评估入口方案。",
  };
}
