import { describe, test, expect } from "vite-plus/test"
import { act, renderHook } from "@testing-library/react"

import type { DirectoryApp } from "../../types/common"
import {
  appMatchesLabels,
  labelSuggestionsFromApps,
} from "../../components/app-directory/filter-apps"
import { useLabelSearch } from "../../hooks/use-label-search"

function app(
  overrides: Partial<DirectoryApp> & Pick<DirectoryApp, "appId" | "title">,
): DirectoryApp {
  return {
    type: "web",
    details: { url: "https://example.com" },
    ...overrides,
  }
}

const chart = app({
  appId: "chart",
  title: "Charts",
  categories: ["Trading"],
})

const news = app({
  appId: "news",
  title: "News",
  categories: ["Research"],
})

describe("useLabelSearch", () => {
  test("filters items by applied labels and derives suggestions", () => {
    const { result } = renderHook(() =>
      useLabelSearch({
        items: [chart, news],
        match: appMatchesLabels,
        suggestions: labelSuggestionsFromApps,
      }),
    )

    expect(result.current.filtered).toEqual([chart, news])
    expect(result.current.suggestions).toEqual(["Research", "Trading", "web"])
    expect(result.current.total).toBe(2)

    act(() => {
      result.current.addLabel("trading")
    })

    expect(result.current.labels).toEqual(["Trading"])
    expect(result.current.filtered).toEqual([chart])
  })
})
