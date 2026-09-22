import assert from "node:assert/strict";
import test from "node:test";
import { filterSignals, firstSignalId } from "../lib/filterSignals.ts";

const signals = [
  { id: "new-fukuoka-ai", reportWeek: "2026-08-17", prefecture: "福岡県", municipality: "北九州市", category: "AI" },
  { id: "new-nagano-health", reportWeek: "2026-08-17", prefecture: "長野県", municipality: "松本市", category: "Healthcare" },
  { id: "old-fukuoka-gov", reportWeek: "2026-08-10", prefecture: "福岡県", municipality: "福岡市", category: "GovTech" },
];

test("default and reset include all weeks, municipalities and categories in archive order", () => {
  assert.deepEqual(filterSignals(signals, { prefecture: null }), signals);
  assert.equal(firstSignalId(signals, { prefecture: null }), "new-fukuoka-ai");
});

test("prefecture selection includes old reports and different municipalities and categories", () => {
  assert.deepEqual(filterSignals(signals, { prefecture: "福岡県" }).map(s => s.id),
    ["new-fukuoka-ai", "old-fukuoka-gov"]);
  assert.equal(firstSignalId(signals, { prefecture: "長野県" }), "new-nagano-health");
});

test("no matches and empty archive have no selected detail", () => {
  assert.deepEqual(filterSignals(signals, { prefecture: "東京都" }), []);
  assert.equal(firstSignalId(signals, { prefecture: "東京都" }), null);
  assert.equal(firstSignalId([], { prefecture: null }), null);
});
