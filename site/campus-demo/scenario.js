export const scenario = {
  label: "CAMPUS DEMO",
  title: "迎新晚会筹备",
  question: "5000 元预算怎么分？",
  presenter: "陈妍",
  presenterInitial: "陈",
  stages: [
    {
      eyebrow: "第一段 · 实时整理",
      title: "大家边聊，AI 边整理预算分歧",
      note: "观众应该看到：零散的群聊和语音正在变成清晰的议题、共识与分歧。",
    },
    {
      eyebrow: "第二段 · AI 参与",
      title: "@AI 给出可执行方案，团队当场确认",
      note: "观众应该看到：AI 能读懂约束，提出算得清、能执行的预算方案。",
    },
    {
      eyebrow: "第三段 · 三天后",
      title: "报价变了，原来的决定还成立吗",
      note: "观众应该看到：决策档案解释当时为什么这样分，条件变化后自动提醒复核。",
    },
  ],
  events: [
    {
      stage: 0, time: "19:02", source: "群聊", author: "陈妍", initials: "陈", tone: "green", type: "human",
      title: "晚会预算", body: "迎新晚会总预算 5000 元。场地、乐队、灯光和应急金怎么分？今晚要定下来。",
      output: { type: "topic", label: "议题", title: "5000 元预算分配", body: "需要在场地、节目效果和风险预留之间做取舍。" },
    },
    {
      stage: 0, time: "19:04", source: "线上语音", author: "周奕", initials: "周", tone: "slate", type: "voice",
      title: "语音发言 · 00:31", body: "场地费就要 2000，安全和基本设备不能省。我觉得场地应该最先锁定。",
      output: { type: "consensus", label: "初步共识", title: "场地费用优先", body: "所有人都同意先保障场地和基本设备。" },
    },
    {
      stage: 0, time: "19:06", source: "群聊", author: "林安", initials: "林", tone: "bronze", type: "human",
      title: "节目效果", body: "如果请乐队要 3000，现场效果肯定好，但这样灯光和应急金就没了。",
      output: { type: "dispute", label: "关键分歧", title: "乐队预算是否过高", body: "3000 元乐队能提升效果，但会挤占灯光和应急预算。" },
    },
    {
      stage: 0, time: "19:07", source: "AI 整理", author: "织见机器人", initials: "AI", tone: "ai", type: "ai",
      title: "实时小结", body: "已识别 1 项共识和 1 个核心分歧：场地必须优先，乐队预算需要重新评估。",
      output: { type: "snapshot", label: "阶段小结", title: "还差一个可执行方案", body: "方案需要同时满足总额 5000 元、场地优先和保留应急金。" },
    },
    {
      stage: 1, time: "19:09", source: "群聊", author: "陈妍", initials: "陈", tone: "green", type: "mention",
      title: "邀请 AI 参与", body: "@织见机器人 按总预算 5000、场地优先、必须留应急金，给一个能执行的方案。",
      output: { type: "loading", label: "正在分析", title: "核对预算与约束", body: "正在读取群聊和语音，计算各项金额是否超出总预算……" },
    },
    {
      stage: 1, time: "19:10", source: "AI 建议", author: "织见机器人", initials: "AI", tone: "ai", type: "ai",
      title: "预算方案", body: "场地 2000、学生乐队 1500、灯光 800、应急金 700，合计 5000。乐队预算控制在 1500 以内。",
      output: { type: "proposal", label: "决策候选", title: "2000 + 1500 + 800 + 700", body: "既保证场地和效果，也保留 700 元应急空间。" },
    },
    {
      stage: 1, time: "19:12", source: "线上语音", author: "林安", initials: "林", tone: "bronze", type: "voice",
      title: "补充条件 · 00:18", body: "可以，但如果场地最后超过 2000，就要先重新谈乐队预算，不能直接挤掉应急金。",
      output: { type: "evidence", label: "成立条件", title: "场地费不超过 2000", body: "若场地报价上升，当前预算分配需要重新讨论。" },
    },
    {
      stage: 1, time: "19:14", source: "决策确认", author: "陈妍", initials: "陈", tone: "green", type: "decision",
      title: "B-001 已确认", body: "按 2000/1500/800/700 分配；周奕明天联系场地，林安后天前确认学生乐队。",
      output: { type: "confirmed", label: "已确认", title: "B-001 · 迎新晚会预算", body: "负责人：周奕、林安｜复核条件：场地费超过 2000 元" },
    },
    {
      stage: 2, time: "三天后 16:20", source: "群聊", author: "周奕", initials: "周", tone: "slate", type: "human",
      title: "回看预算", body: "为什么当时把乐队预算压到 1500？有人建议还是请 3000 元的商业乐队。",
      output: { type: "archive", label: "决策档案", title: "正在打开 B-001", body: "预算约束、双方观点和确认时的条件都已保存。" },
    },
    {
      stage: 2, time: "三天后 16:21", source: "决策档案", author: "织见机器人", initials: "AI", tone: "ai", type: "archive",
      title: "B-001 · 为什么乐队上限 1500", body: "总预算只有 5000；场地优先；团队还要保留灯光 800 和应急金 700。商业乐队方案会超支。",
      output: { type: "record", label: "完整档案", title: "决定为什么产生，一眼能看懂", body: "2 条预算约束 · 2 组观点 · 2 个负责人 · 1 个复核条件" },
    },
    {
      stage: 2, time: "三天后 16:24", source: "新报价", author: "周奕", initials: "周", tone: "slate", type: "metric",
      title: "场地报价更新", body: "场地方最新报价是 2300 元，比原计划高 300 元。",
      output: { type: "loading", label: "正在复核", title: "对照 B-001 的成立条件", body: "检测到场地报价发生变化，正在判断是否影响预算决定……" },
    },
    {
      stage: 2, time: "三天后 16:25", source: "AI 提醒", author: "织见机器人", initials: "AI", tone: "ai", type: "alert",
      title: "建议重新讨论 B-001", body: "场地报价 2300 元，已超过 2000 元的复核线。建议优先调整乐队方案，不要直接取消应急金。",
      output: { type: "review", label: "复核已触发", title: "B-001 需要重新讨论", body: "触发原因：场地 2300 元 ＞ 2000 元｜状态：等待负责人调整方案" },
    },
  ],
};
