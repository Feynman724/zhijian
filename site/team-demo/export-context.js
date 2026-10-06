const sourceLabel = (event) => event.source || "未标记来源";

export function buildContext(scenario, count = scenario.events.length) {
  const events = scenario.events.slice(0, count).map((event, index) => ({
    id: `E${String(index + 1).padStart(3, "0")}`,
    stage: event.stage,
    time: event.time,
    source: sourceLabel(event),
    speaker: event.author,
    type: event.type,
    title: event.title,
    content: event.body,
    analysis: event.output ? {
      label: event.output.label,
      title: event.output.title,
      content: event.output.body
    } : null
  }));
  return {
    format: "zhijian-discussion-context-v2",
    demo: true,
    title: scenario.title,
    question: scenario.question,
    exportedEvents: events.length,
    events,
    decisions: count >= 10 ? [scenario.decision] : []
  };
}

export function toMarkdown(context) {
  const lines = [
    `# ${context.title}`,
    "",
    `> 议题：${context.question}`,
    `> 来源：织见演示数据 · 共 ${context.exportedEvents} 条时间线记录`,
    "",
    "## 讨论时间线",
    ""
  ];
  for (const event of context.events) {
    lines.push(`### ${event.id} · ${event.time} · ${event.source}`);
    lines.push(`- 发言人：${event.speaker}`);
    lines.push(`- 类型：${event.title || event.type}`);
    lines.push(`- 原文：${event.content}`);
    if (event.analysis) lines.push(`- 织见整理：${event.analysis.title}——${event.analysis.content}`);
    lines.push("");
  }
  for (const decision of context.decisions) {
    lines.push(`## 决策 ${decision.id}`);
    lines.push("");
    lines.push(`- 结论：${decision.conclusion}`);
    lines.push(`- 负责人：${decision.owner}`);
    lines.push(`- 完成期限：${decision.deadline}`);
    lines.push(`- 确认成员：${decision.confirmedBy.join("、")}`);
    lines.push(`- 支持依据：${decision.evidence.map((item) => `${item.ref} ${item.note}`).join("；")}`);
    lines.push(`- 反方意见：${decision.dissent.ref} ${decision.dissent.note}`);
    lines.push(`- 复核条件：${decision.reviewTrigger}`);
    lines.push("");
  }
  lines.push("---", "此文件为演示数据，可复制给任意支持 Markdown 的工具或模型继续分析。", "");
  return lines.join("\n");
}
