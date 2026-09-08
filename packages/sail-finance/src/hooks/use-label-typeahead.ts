import * as React from "react"

import { canonicalLabel, hasLabel, normalizeLabel } from "@/lib/labels"

export interface UseLabelTypeaheadOptions {
  labels: string[]
  suggestions?: string[]
  allowCreate?: boolean
  disabled?: boolean
  addLabel: (raw: string) => boolean
  removeLabel: (label: string) => void
}

export function useLabelTypeahead({
  labels,
  suggestions = [],
  allowCreate = true,
  disabled = false,
  addLabel,
  removeLabel,
}: UseLabelTypeaheadOptions) {
  const listboxId = React.useId()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [query, setQuery] = React.useState("")
  const [focused, setFocused] = React.useState(false)
  const [highlight, setHighlight] = React.useState(0)

  const unusedSuggestions = React.useMemo(
    () => suggestions.filter(suggestion => !hasLabel(labels, suggestion)),
    [suggestions, labels],
  )

  const filteredSuggestions = React.useMemo(() => {
    const q = normalizeLabel(query).toLowerCase()
    if (!q) return unusedSuggestions
    return unusedSuggestions.filter(suggestion => suggestion.toLowerCase().includes(q))
  }, [query, unusedSuggestions])

  const canCreate =
    allowCreate &&
    normalizeLabel(query).length > 0 &&
    !hasLabel(labels, query) &&
    !canonicalLabel(suggestions, query)

  const options = React.useMemo(() => {
    const next = [...filteredSuggestions]
    if (canCreate) next.push(normalizeLabel(query))
    return next
  }, [canCreate, filteredSuggestions, query])

  const listOpen = focused && !disabled && options.length > 0

  React.useEffect(() => {
    setHighlight(0)
  }, [query, listOpen])

  const select = React.useCallback(
    (raw: string) => {
      if (addLabel(raw)) {
        setQuery("")
        setHighlight(0)
      }
    },
    [addLabel],
  )

  const commitFromInput = React.useCallback(() => {
    if (listOpen && options[highlight]) {
      select(options[highlight])
      return
    }
    if (allowCreate) select(query)
  }, [allowCreate, highlight, listOpen, options, query, select])

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Backspace" && query.length === 0 && labels.length > 0) {
        event.preventDefault()
        removeLabel(labels[labels.length - 1]!)
        return
      }

      if (event.key === "ArrowDown" && listOpen) {
        event.preventDefault()
        setHighlight(index => (index + 1) % options.length)
        return
      }

      if (event.key === "ArrowUp" && listOpen) {
        event.preventDefault()
        setHighlight(index => (index - 1 + options.length) % options.length)
        return
      }

      if (event.key === "Escape") {
        setQuery("")
        inputRef.current?.blur()
        return
      }

      if (event.key === "Enter" || event.key === ",") {
        event.preventDefault()
        commitFromInput()
      }
    },
    [commitFromInput, labels, listOpen, options.length, query.length, removeLabel],
  )

  return {
    query,
    setQuery,
    focused,
    setFocused,
    highlight,
    setHighlight,
    options,
    canCreate,
    listOpen,
    listboxId,
    inputRef,
    select,
    onKeyDown,
    focusInput: () => inputRef.current?.focus(),
  }
}
