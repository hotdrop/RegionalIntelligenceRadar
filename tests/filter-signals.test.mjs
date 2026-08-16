import assert from "node:assert/strict";
import test from "node:test";
import { filterSignals, firstSignalId } from "../data/filterSignals.ts";
import { mockSignals } from "../data/mockSignals.ts";

test("prefecture and category filters use AND semantics", () => {
  const fukuokaSignals = filterSignals(mockSignals, { prefecture: "福岡県", category: null });
  assert.equal(fukuokaSignals.length, 2);
  assert.ok(fukuokaSignals.every((signal) => signal.prefecture === "福岡県"));

  const matching = filterSignals(mockSignals, { prefecture: "福岡県", category: "AI" });
  assert.deepEqual(matching.map((signal) => signal.id), ["sig-001"]);

  const empty = filterSignals(mockSignals, { prefecture: "福岡県", category: "Healthcare" });
  assert.deepEqual(empty, []);
});

test("firstSignalId follows the visible list and clears on empty results", () => {
  assert.equal(firstSignalId(mockSignals, { prefecture: "長野県", category: null }), "sig-002");
  assert.equal(firstSignalId(mockSignals, { prefecture: "長野県", category: "Aging Society" }), "sig-013");
  assert.equal(firstSignalId(mockSignals, { prefecture: "長野県", category: "Tourism" }), null);
  assert.equal(firstSignalId(mockSignals, { prefecture: null, category: null }), mockSignals[0].id);
});
