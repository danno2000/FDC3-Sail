import type { ReactNode } from "react"

import { useLabelSearch } from "@/hooks/use-label-search"
import { LabelField } from "@/components/ui/label-field"

export interface LabelSearchRenderProps<T> {
  filtered: T[]
  labels: string[]
  total: number
  field: ReactNode
}

export interface LabelSearchProps<T> {
  items: T[]
  match: (item: T, labels: string[]) => boolean
  suggestions?: string[] | ((items: T[]) => string[])
  placeholder?: string
  allowCreate?: boolean
  disabled?: boolean
  className?: string
  "aria-label"?: string
  children: (state: LabelSearchRenderProps<T>) => ReactNode
}

export function LabelSearch<T>({
  items,
  match,
  suggestions,
  placeholder,
  allowCreate,
  disabled,
  className,
  "aria-label": ariaLabel,
  children,
}: LabelSearchProps<T>) {
  const search = useLabelSearch({ items, match, suggestions })

  return children({
    filtered: search.filtered,
    labels: search.labels,
    total: search.total,
    field: (
      <LabelField
        value={search.labels}
        onChange={search.setLabels}
        suggestions={search.suggestions}
        placeholder={placeholder}
        allowCreate={allowCreate}
        disabled={disabled}
        className={className}
        aria-label={ariaLabel}
      />
    ),
  })
}
