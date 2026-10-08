function normalizeEvent(event, index) {
  return {
    id: event.id || `E${String(index + 1).padStart(3, '0')}`,
    time: event.time,
    source: event.source,
    speaker: event.author,
    type: event.type,
    title: event.title,
    content: event.body,
    analysis: event.output ? `${event.output.title}：${event.output.body}` : ''
  };
}

function buildContext(scenario, events, decisions) {
  return {
    format: 'zhijian-discussion-context-v2',
    demo: true,
    title: scenario.title,
    question: scenario.question,
    exportedEvents: events.length,
    events: events.map(normalizeEvent),
    decisions
  };
}

function toMarkdown(context) {
  const lines = [
    `# ${context.title}`, '',
    `> 议题：${context.question}`,
    `> 共 ${context.exportedEvents} 条时间线记录；群聊、会议和文件依时间排列。`, '',
    '## 讨论时间线', ''
  ];
  context.events.forEach((event) => {
    lines.push(`### ${event.id} · ${event.time} · ${event.source}`);
    lines.push(`- 发言人：${event.speaker}`);
    lines.push(`- 类型：${event.title || event.type}`);
    lines.push(`- 原文：${event.content}`);
    if (event.analysis) lines.push(`- 织见整理：${event.analysis}`);
    lines.push('');
  });
  context.decisions.forEach((decision) => {
    lines.push(`## 决策 ${decision.id}`, '');
    lines.push(`- 结论：${decision.conclusion}`);
    lines.push(`- 负责人：${decision.owner}`);
    lines.push(`- 完成期限：${decision.deadline}`);
    lines.push(`- 确认成员：${decision.confirmedBy.join('、')}`);
    lines.push(`- 支持依据：${decision.evidence.map((item) => `${item.ref} ${item.note}`).join('；')}`);
    lines.push(`- 反方意见：${decision.dissent.ref} ${decision.dissent.note}`);
    lines.push(`- 复核条件：${decision.reviewTrigger}`, '');
  });
  lines.push('---', '可复制给任意支持 Markdown 的工具或模型继续分析。', '');
  return lines.join('\n');
}

function answerQuestion(question, context) {
  const decision = context.decisions[0];
  if (!decision) return '当前尚无已确认决策。可以先查看会议观点和群聊讨论，再由成员确认。';
  if (/为什么|依据|原因/.test(question)) {
    return `D-001 的支持依据是 ${decision.evidence.map((item) => `${item.ref} ${item.note}`).join('；')}。反方意见 ${decision.dissent.ref} 仍被保留。`;
  }
  if (/复核|改变|条件|30%/.test(question)) return `${decision.reviewTrigger}。原决策和出处会保留，不会被新结论覆盖。`;
  return `当前结论：${decision.conclusion}。负责人 ${decision.owner}，${decision.deadline}。你可以在决策页查看依据、反方意见和复核条件。`;
}

module.exports = { buildContext, toMarkdown, answerQuestion };
