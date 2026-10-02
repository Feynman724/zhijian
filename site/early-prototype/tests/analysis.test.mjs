import test from "node:test";
import assert from "node:assert/strict";

import { decisionSeed, meetingSessions, seedEvents } from "../src/data.js";
import {
  buildCatchUp,
  buildDecision,
  buildInsights,
  buildTimelineBlocks,
  evaluateDecision,
} from "../src/analysis.js";

test("buildTimelineBlocks keeps chat, meeting, and offline contexts distinct on one chronology", () => {
  const blocks = buildTimelineBlocks(seedEvents, meetingSessions);

  assert.deepEqual(blocks.map((block) => block.type), ["chat", "meeting", "offline", "chat"]);
  assert.equal(blocks[0].events.every((event) => event.channel === "chat"), true);
  assert.equal(blocks[1].events.every((event) => event.meetingId === "meeting-product-sync"), true);
  assert.equal(blocks[2].events.every((event) => event.channel === "offline"), true);
  assert.equal(blocks[3].events.every((event) => event.channel === "chat"), true);
});

test("buildInsights returns grounded, cross-modal insight cards", () => {
  const insights = buildInsights(seedEvents);

  assert.equal(insights.length, 4);
  assert.equal(
    insights.some(
      (item) =>
        item.sources.length >= 2 &&
        new Set(
          item.sources.map(
            (sourceId) => seedEvents.find((event) => event.id === sourceId)?.modality,
          ),
        ).size >= 2,
    ),
    true,
  );
  assert.equal(insights.every((item) => item.sources.length > 0), true);
});

test("buildCatchUp summarizes the current decision space", () => {
  const catchUp = buildCatchUp(seedEvents);

  assert.match(catchUp.summary, /网页/);
  assert.match(catchUp.summary, /小程序/);
  assert.equal(catchUp.openQuestions.length > 0, true);
});

test("buildDecision preserves confirmed status, evidence, opposition, conditions, and triggers", () => {
  const decision = buildDecision(seedEvents);

  assert.equal(decision.status, "confirmed");
  assert.equal(decision.evidence.length >= 2, true);
  assert.equal(decision.opposition.length > 0, true);
  assert.equal(decision.conditions.length > 0, true);
  assert.equal(decision.reviewTriggers.length > 0, true);
});

test("evaluateDecision marks a decision for review when new evidence changes its condition", () => {
  const contradictoryEvent = {
    id: "new-evidence",
    modality: "file",
    title: "新增访谈：客户拒绝跳转网页",
    body: "8 位受访者中有 7 位表示只愿意在微信内完成操作。",
    tags: ["new-evidence", "wechat-preference"],
  };

  const result = evaluateDecision(decisionSeed, contradictoryEvent);

  assert.equal(result.status, "review");
  assert.equal(result.impactSources.includes("new-evidence"), true);
});
