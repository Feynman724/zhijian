module.exports = {
  "label": "INTERNAL DEMO · CHAT × MEETING",
  "title": "产品方向讨论",
  "question": "群聊、会议和文件如何形成一条完整的决策时间线？",
  "presenter": "孙宇杰",
  "presenterInitial": "孙",
  "decision": {
    "id": "D-001",
    "conclusion": "第一版先完成网页 Demo，验证讨论整理与决策确认流程",
    "owner": "张轩灏",
    "deadline": "7 天内",
    "confirmedBy": [
      "孙宇杰",
      "卢格妤",
      "张轩灏"
    ],
    "evidence": [
      {
        "ref": "E003",
        "note": "会议中提出网页可以更快验证核心流程"
      },
      {
        "ref": "E005",
        "note": "共享访谈文件补充了入口成本的证据"
      }
    ],
    "dissent": {
      "ref": "E004",
      "note": "网页入口可能降低参与意愿"
    },
    "reviewTrigger": "完成讨论率低于 30% 时重新讨论入口"
  },
  "stages": [
    {
      "eyebrow": "第一段 · 跨场景收集",
      "title": "群聊发起，会议展开，内容回到同一条时间线",
      "note": "重点展示：一次会议不是孤立纪要，而是群聊议题的继续，并保留逐段发言和共享材料。"
    },
    {
      "eyebrow": "第二段 · 人工智能参与",
      "title": "会后继续在群里推进，把分歧变成可确认的决定",
      "note": "重点展示：人工智能同时读取群聊、会议转写和文件，并在原生讨论中参与。"
    },
    {
      "eyebrow": "第三段 · 三天后",
      "title": "为什么这样决定，条件变了怎么办",
      "note": "重点展示：会议观点成为决策依据，新数据触发复核时仍能回到原话。"
    }
  ],
  "events": [
    {
      "stage": 0,
      "time": "09:02",
      "source": "产品方向群",
      "author": "孙宇杰",
      "initials": "孙",
      "tone": "green",
      "type": "human",
      "title": "讨论目标",
      "body": "第一版到底先做网页还是小程序？文字里说不清，我们 9:30 开个产品同步会，把理由和判断条件谈透。",
      "output": {
        "type": "topic",
        "label": "群聊议题",
        "title": "第一版入口选择",
        "body": "网页 Demo 与微信小程序，哪一个更适合当前验证？"
      }
    },
    {
      "stage": 0,
      "time": "09:30",
      "source": "产品同步会",
      "author": "会议",
      "initials": "会",
      "tone": "meeting",
      "type": "meeting-start",
      "title": "线上会议已接入",
      "body": "产品同步会 · 孙宇杰、卢格妤、张轩灏 · 自动转写与说话人识别已开启。",
      "output": {
        "type": "meeting",
        "label": "会议接入",
        "title": "继续同一个讨论",
        "body": "会议已自动关联 09:02 的群聊议题，不会新建一份孤立记录。"
      }
    },
    {
      "stage": 0,
      "time": "09:34",
      "source": "产品同步会",
      "author": "张轩灏",
      "initials": "张",
      "tone": "slate",
      "type": "meeting-note",
      "title": "会议转写 · 03:48",
      "body": "我倾向先做网页。几天内就能跑通讨论、整理和决策确认，先验证团队愿不愿意持续使用。",
      "output": {
        "type": "consensus",
        "label": "会议观点",
        "title": "先验证核心流程",
        "body": "支持理由：网页上线快，适合先验证讨论整合与结构化决策。"
      }
    },
    {
      "stage": 0,
      "time": "09:38",
      "source": "产品同步会",
      "author": "卢格妤",
      "initials": "卢",
      "tone": "bronze",
      "type": "meeting-note",
      "title": "会议转写 · 07:16",
      "body": "网页会增加进入成本。即使最后选择网页，这条反方意见也必须进入决策，而不是被会议总结抹掉。",
      "output": {
        "type": "dispute",
        "label": "会议分歧",
        "title": "验证速度 vs. 入口成本",
        "body": "网页上线快，但独立入口可能带来明显流失。"
      }
    },
    {
      "stage": 0,
      "time": "09:42",
      "source": "会议共享文件",
      "author": "卢格妤",
      "initials": "卢",
      "tone": "bronze",
      "type": "file",
      "title": "9 月用户访谈摘录.pdf",
      "body": "会议中引用：7/10 的受访团队需要反复补充上下文，入口切换也会降低参与意愿。",
      "output": {
        "type": "evidence",
        "label": "会议证据",
        "title": "文件已关联到发言",
        "body": "共享材料与 09:38 的反方观点建立引用关系。"
      }
    },
    {
      "stage": 0,
      "time": "09:48",
      "source": "产品同步会",
      "author": "织见机器人",
      "initials": "AI",
      "tone": "ai",
      "type": "meeting-end",
      "title": "会议结束 · 18:24",
      "body": "会议形成 1 项共识、1 个分歧和 1 个待确认条件。完整转写、关键片段与共享文件已回到原讨论时间线。",
      "output": {
        "type": "snapshot",
        "label": "会议小结",
        "title": "结论还没有被过早确定",
        "body": "已明确争议；下一步需要设定可以推翻当前方案的客观条件。"
      }
    },
    {
      "stage": 1,
      "time": "10:06",
      "source": "产品方向群",
      "author": "孙宇杰",
      "initials": "孙",
      "tone": "green",
      "type": "mention",
      "title": "会后继续讨论",
      "body": "@织见机器人 结合早上的群聊、刚才的会议转写和访谈文件，给一个可验证的推进方案。",
      "output": {
        "type": "loading",
        "label": "正在分析",
        "title": "读取跨场景上下文",
        "body": "群聊 2 条 · 会议记录 4 段 · 共享文件 1 份……"
      }
    },
    {
      "stage": 1,
      "time": "10:07",
      "source": "人工智能建议",
      "author": "织见机器人",
      "initials": "AI",
      "tone": "ai",
      "type": "ai",
      "title": "基于完整上下文生成",
      "body": "先用网页验证核心流程，同时把完成讨论率设为复核条件；如果低于 30%，立即重新评估微信入口。",
      "output": {
        "type": "proposal",
        "label": "决策候选",
        "title": "网页先行 + 明确复核线",
        "body": "获得速度优势，同时保留推翻当前方案的客观条件。"
      }
    },
    {
      "stage": 1,
      "time": "10:09",
      "source": "产品方向群",
      "author": "卢格妤",
      "initials": "卢",
      "tone": "bronze",
      "type": "human",
      "title": "引用会议发言",
      "body": "同意，但把我在会议里说的入口流失风险保留下来，并引用访谈文件，不要只保存最后一句结论。",
      "output": {
        "type": "evidence",
        "label": "反方意见",
        "title": "网页入口可能阻碍参与",
        "body": "引用：会议 09:38 发言 +《9 月用户访谈摘录》"
      }
    },
    {
      "stage": 1,
      "time": "10:12",
      "source": "决策确认",
      "author": "孙宇杰",
      "initials": "孙",
      "tone": "green",
      "type": "decision",
      "title": "D-001 已确认",
      "body": "第一版先做网页 Demo；张轩灏 7 天内完成。完成讨论率低于 30% 时重新讨论入口。三人确认。",
      "output": {
        "type": "confirmed",
        "label": "已确认",
        "title": "D-001 · 网页 Demo 先行",
        "body": "依据：群聊 2 条 · 会议 3 段 · 文件 1 份｜复核线：30%"
      }
    },
    {
      "stage": 2,
      "time": "三天后 10:03",
      "source": "产品方向群",
      "author": "卢格妤",
      "initials": "卢",
      "tone": "bronze",
      "type": "human",
      "title": "回看决策",
      "body": "当时为什么决定先做网页？我记得会议里也有人担心入口问题。",
      "output": {
        "type": "archive",
        "label": "决策档案",
        "title": "正在打开 D-001",
        "body": "结论、会议原话、共享文件、反方意见和成立条件均已保存。"
      }
    },
    {
      "stage": 2,
      "time": "三天后 10:04",
      "source": "决策档案",
      "author": "织见机器人",
      "initials": "AI",
      "tone": "ai",
      "type": "archive",
      "title": "D-001 · 为什么先做网页",
      "body": "支持依据来自会议 09:34；反方意见来自会议 09:38；访谈文件提供外部证据；成立条件为完成讨论率不低于 30%。",
      "output": {
        "type": "record",
        "label": "完整档案",
        "title": "决定能回到会议原话",
        "body": "2 条群聊 · 3 段会议引用 · 1 份文件 · 1 条反方意见"
      }
    },
    {
      "stage": 2,
      "time": "三天后 10:06",
      "source": "新数据",
      "author": "张轩灏",
      "initials": "张",
      "tone": "slate",
      "type": "metric",
      "title": "首轮试用结果",
      "body": "100 人收到邀请，24 人完成讨论，完成率 24%。",
      "output": {
        "type": "loading",
        "label": "正在复核",
        "title": "对照 D-001 的复核条件",
        "body": "检测到新的量化证据，正在判断是否影响原决策……"
      }
    },
    {
      "stage": 2,
      "time": "三天后 10:07",
      "source": "人工智能提醒",
      "author": "织见机器人",
      "initials": "AI",
      "tone": "ai",
      "type": "alert",
      "title": "建议重新讨论 D-001",
      "body": "完成率 24%，已低于 30% 的复核线。原决策不会被覆盖；会议依据与新数据会一起进入复核。",
      "output": {
        "type": "review",
        "label": "复核已触发",
        "title": "D-001 需要重新讨论",
        "body": "触发原因：完成讨论率 24% ＜ 30%｜状态：等待团队复核"
      }
    }
  ]
};
