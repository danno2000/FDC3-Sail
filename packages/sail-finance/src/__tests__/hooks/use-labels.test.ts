import { describe, test, expect } from "vite-plus/test"
import { act, renderHook } from "@testing-library/react"

import { useLabels } from "../../hooks/use-labels"

describe("useLabels", () => {
  test("adds, dedupes, and removes labels", () => {
    const { result } = renderHook(() => useLabels({ suggestions: ["ViewChart"] }))

    act(() => {
      result.current.addLabel("viewchart")
    })
    expect(result.current.labels).toEqual(["ViewChart"])

    act(() => {
      result.current.addLabel("ViewChart")
    })
    expect(result.current.labels).toEqual(["ViewChart"])

    act(() => {
      result.current.removeLabel("ViewChart")
    })
    expect(result.current.labels).toEqual([])
  })

  test("notifies onChange in controlled mode", () => {
    const received: string[][] = []
    const { result, rerender } = renderHook(
      ({ value }) =>
        useLabels({
          value,
          onChange: next => received.push(next),
        }),
      { initialProps: { value: [] as string[] } },
    )

    act(() => {
      result.current.addLabel("charts")
    })
    expect(received).toEqual([["charts"]])

    rerender({ value: ["charts"] })
    expect(result.current.labels).toEqual(["charts"])
  })
})
