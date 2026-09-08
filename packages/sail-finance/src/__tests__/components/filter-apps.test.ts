import { describe, test, expect } from "vite-plus/test"

import type { DirectoryApp } from "../../types/common"
import {
  appMatchesLabels,
  labelSuggestionsFromApps,
} from "../../components/app-directory/filter-apps"

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
  description: "Price charts",
  interop: { intents: { listensFor: { ViewChart: { contexts: ["fdc3.instrument"] } } } },
})

const news = app({
  appId: "news",
  title: "News",
  categories: ["Research"],
  publisher: "Example",
})

describe("appMatchesLabels", () => {
  test("matches every applied label against searchable app fields", () => {
    expect(appMatchesLabels(chart, [])).toBe(true)
    expect(appMatchesLabels(chart, ["trading"])).toBe(true)
    expect(appMatchesLabels(chart, ["ViewChart"])).toBe(true)
    expect(appMatchesLabels(chart, ["trading", "news"])).toBe(false)
    expect(appMatchesLabels(news, ["research"])).toBe(true)
  })
})

describe("labelSuggestionsFromApps", () => {
  test("collects unique categories, types, and intent names", () => {
    expect(labelSuggestionsFromApps([chart, news])).toEqual([
      "Research",
      "Trading",
      "ViewChart",
      "web",
    ])
  })
})
