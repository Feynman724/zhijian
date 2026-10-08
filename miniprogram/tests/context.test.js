const assert = require('node:assert/strict');
const scenario = require('../data/scenario.json');
const { buildContext, toMarkdown, answerQuestion } = require('../lib/context.js');

const context = buildContext(scenario, scenario.events, [scenario.decision]);
const markdown = toMarkdown(context);
assert.equal(context.events.length, scenario.events.length);
assert.equal(context.decisions[0].id, 'D-001');
assert.ok(markdown.indexOf('09:02 · 产品方向群') < markdown.indexOf('09:34 · 产品同步会'));
assert.match(markdown, /E003.*会议中提出网页/);
assert.match(markdown, /E004.*网页入口可能/);
assert.match(markdown, /E005.*访谈文件/);
assert.match(answerQuestion('为什么做网页？', context), /E003/);
assert.match(answerQuestion('什么条件下复核？', context), /30%/);
console.log('小程序上下文与导出逻辑检查通过');
