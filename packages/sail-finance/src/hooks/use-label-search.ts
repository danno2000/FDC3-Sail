import * as React from "react"

import { useLabels } from "./use-labels"

export interface UseLabelSearchOptions<T> {
  items: T[]
  match: (item: T, labels: string[]) => boolean
  suggestions?: string[] | ((items: T[]) => string[])
}

export function useLabelSearch<T>({
  items,
  match,
  suggestions: suggestionsProp,
}: UseLabelSearchOptions<T>) {
  const resolvedSuggestions = React.useMemo(
    () =>
      typeof suggestionsProp === "function" ? suggestionsProp(items) : (suggestionsProp ?? []),
    [items, suggestionsProp],
  )

  const { labels, setLabels, addLabel, removeLabel } = useLabels({
    suggestions: resolvedSuggestions,
  })

  const filtered = React.useMemo(
    () => (labels.length === 0 ? items : items.filter(item => match(item, labels))),
    [items, labels, match],
  )

  return {
    labels,
    setLabels,
    addLabel,
    removeLabel,
    filtered,
    suggestions: resolvedSuggestions,
    total: items.length,
  }
}
