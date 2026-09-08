import { describe, test, expect } from "vite-plus/test"

import { addLabelToList, hasLabel, normalizeLabel, removeLabelFromList } from "../../lib/labels"

describe("labels", () => {
  test("addLabelToList trims, dedupes case-insensitively, and prefers suggestion spelling", () => {
    expect(addLabelToList(["web"], "  ")).toBeNull()
    expect(addLabelToList(["web"], "Web")).toBeNull()
    expect(addLabelToList(["charts"], "web", ["ViewChart", "web"])).toEqual(["charts", "web"])
    expect(normalizeLabel("  trading  ")).toBe("trading")
    expect(hasLabel(["ViewChart"], "viewchart")).toBe(true)
  })

  test("removeLabelFromList drops the matching label", () => {
    expect(removeLabelFromList(["web", "charts"], "charts")).toEqual(["web"])
  })
})
