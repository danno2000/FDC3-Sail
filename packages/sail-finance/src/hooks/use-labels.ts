import * as React from "react"

import { addLabelToList, hasLabel, removeLabelFromList } from "@/lib/labels"

export interface UseLabelsOptions {
  value?: string[]
  defaultValue?: string[]
  onChange?: (labels: string[]) => void
  suggestions?: string[]
}

export function useLabels({
  value: valueProp,
  defaultValue = [],
  onChange,
  suggestions = [],
}: UseLabelsOptions = {}) {
  const [internal, setInternal] = React.useState(defaultValue)
  const isControlled = valueProp !== undefined
  const labels = isControlled ? valueProp : internal

  const setLabels = React.useCallback(
    (next: string[]) => {
      if (!isControlled) setInternal(next)
      onChange?.(next)
    },
    [isControlled, onChange],
  )

  const addLabel = React.useCallback(
    (raw: string) => {
      const next = addLabelToList(labels, raw, suggestions)
      if (!next) return false
      setLabels(next)
      return true
    },
    [labels, setLabels, suggestions],
  )

  const removeLabel = React.useCallback(
    (label: string) => {
      setLabels(removeLabelFromList(labels, label))
    },
    [labels, setLabels],
  )

  return {
    labels,
    setLabels,
    addLabel,
    removeLabel,
    has: (candidate: string) => hasLabel(labels, candidate),
  }
}
