import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { useLabels } from "@/hooks/use-labels"
import { useLabelTypeahead } from "@/hooks/use-label-typeahead"
import { Badge } from "./badge"

export interface LabelFieldProps {
  value: string[]
  onChange: (labels: string[]) => void
  /** Optional typeahead source. Omit or pass `[]` for freeform labels only. */
  suggestions?: string[]
  placeholder?: string
  /** When true (default), Enter/comma can create a label that is not in `suggestions`. */
  allowCreate?: boolean
  disabled?: boolean
  id?: string
  className?: string
  "aria-label"?: string
}

export function LabelField({
  value,
  onChange,
  suggestions = [],
  placeholder = "Add a label…",
  allowCreate = true,
  disabled = false,
  id,
  className,
  "aria-label": ariaLabel = "Labels",
}: LabelFieldProps) {
  const { addLabel, removeLabel } = useLabels({ value, onChange, suggestions })
  const {
    query,
    setQuery,
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
    focusInput,
  } = useLabelTypeahead({
    labels: value,
    suggestions,
    allowCreate,
    disabled,
    addLabel,
    removeLabel,
  })

  return (
    <div className={cn("relative", className)}>
      <div
        data-slot="label-field"
        className={cn(
          "border-input focus-within:border-ring focus-within:ring-ring/50 dark:bg-input/30 flex min-h-9 w-full cursor-text flex-wrap items-center gap-1.5 rounded-md border bg-transparent px-2.5 py-1 shadow-xs transition-[color,box-shadow] focus-within:ring-[3px]",
          disabled && "pointer-events-none cursor-not-allowed opacity-50",
        )}
        onClick={focusInput}
      >
        {value.map(label => (
          <Badge key={label} variant="secondary" className="gap-0.5 pr-0.5">
            {label}
            <button
              type="button"
              className="hover:bg-muted-foreground/20 focus-visible:ring-ring ml-0.5 rounded-sm p-0.5 focus-visible:ring-2 focus-visible:outline-none"
              aria-label={`Remove ${label}`}
              disabled={disabled}
              onClick={event => {
                event.stopPropagation()
                removeLabel(label)
              }}
            >
              <X className="size-3" />
            </button>
          </Badge>
        ))}
        <input
          ref={inputRef}
          id={id}
          value={query}
          disabled={disabled}
          aria-label={ariaLabel}
          aria-autocomplete={suggestions.length > 0 ? "list" : "none"}
          aria-controls={listOpen ? listboxId : undefined}
          aria-expanded={listOpen}
          aria-activedescendant={listOpen ? `${listboxId}-option-${highlight}` : undefined}
          role="combobox"
          placeholder={value.length === 0 ? placeholder : undefined}
          className="placeholder:text-muted-foreground min-w-[8rem] flex-1 bg-transparent py-0.5 text-sm outline-none"
          onChange={event => setQuery(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false)
            if (allowCreate) select(query)
          }}
          onKeyDown={onKeyDown}
        />
      </div>
      {listOpen ? (
        <ul
          id={listboxId}
          role="listbox"
          className="bg-popover text-popover-foreground absolute top-[calc(100%+0.25rem)] z-50 max-h-60 w-full overflow-auto rounded-md border p-1 shadow-md"
        >
          {options.map((option, index) => {
            const isCreate = canCreate && index === options.length - 1
            return (
              <li
                key={`${option}-${index}`}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={index === highlight}
                className={cn(
                  "cursor-pointer rounded-sm px-2 py-1.5 text-sm",
                  index === highlight && "bg-accent text-accent-foreground",
                )}
                onMouseDown={event => {
                  event.preventDefault()
                  select(option)
                  focusInput()
                }}
                onMouseEnter={() => setHighlight(index)}
              >
                {isCreate ? `Add “${option}”` : option}
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
