import assert from "node:assert/strict";
import test from "node:test";
import { ALL_WEEKS, filterSignals, firstSignalId } from "../data/filterSignals.ts";

const signals = [
  { id: "new-fukuoka-ai", reportWeek: "2026-08-17", prefecture: "福岡県", municipality: "北九州市", category: "AI" },
  { id: "new-nagano-health", reportWeek: "2026-08-17", prefecture: "長野県", municipality: "松本市", category: "Healthcare" },
  { id: "old-fukuoka-gov", reportWeek: "2026-08-10", prefecture: "福岡県", municipality: "北九州市", category: "GovTech" },
];

const emptyDimensions = { prefecture: null, municipality: null, category: null };

test("week filters support latest, past weeks, and all", () => {
  assert.deepEqual(
    filterSignals(signals, { week: "2026-08-17", ...emptyDimensions }).map((signal) => signal.id),
    ["new-fukuoka-ai", "new-nagano-health"],
  );
  assert.deepEqual(
    filterSignals(signals, { week: "2026-08-10", ...emptyDimensions }).map((signal) => signal.id),
    ["old-fukuoka-gov"],
  );
  assert.equal(filterSignals(signals, { week: ALL_WEEKS, ...emptyDimensions }).length, 3);
});

test("week, prefecture, municipality, and category filters use AND semantics", () => {
  const matching = filterSignals(signals, {
    week: ALL_WEEKS,
    prefecture: "福岡県",
    municipality: "北九州市",
    category: "GovTech",
  });
  assert.deepEqual(matching.map((signal) => signal.id), ["old-fukuoka-gov"]);

  const empty = filterSignals(signals, {
    week: "2026-08-17",
    prefecture: "福岡県",
    municipality: "北九州市",
    category: "Healthcare",
  });
  assert.deepEqual(empty, []);
});

test("firstSignalId follows the visible list and clears on empty results", () => {
  assert.equal(firstSignalId(signals, { week: "2026-08-17", ...emptyDimensions }), "new-fukuoka-ai");
  assert.equal(firstSignalId(signals, {
    week: "2026-08-10", prefecture: "長野県", municipality: null, category: null,
  }), null);
});
