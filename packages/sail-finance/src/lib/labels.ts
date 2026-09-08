export function normalizeLabel(label: string): string {
  return label.trim()
}

export function hasLabel(labels: string[], candidate: string): boolean {
  const key = normalizeLabel(candidate).toLowerCase()
  if (!key) return false
  return labels.some(label => label.toLowerCase() === key)
}

export function canonicalLabel(suggestions: string[], query: string): string | undefined {
  const key = normalizeLabel(query).toLowerCase()
  return suggestions.find(suggestion => suggestion.toLowerCase() === key)
}

/** Returns the next label list, or `null` if `raw` is empty or already present. */
export function addLabelToList(
  labels: string[],
  raw: string,
  suggestions: string[] = [],
): string[] | null {
  const trimmed = normalizeLabel(raw)
  if (!trimmed || hasLabel(labels, trimmed)) return null
  return [...labels, canonicalLabel(suggestions, trimmed) ?? trimmed]
}

export function removeLabelFromList(labels: string[], label: string): string[] {
  return labels.filter(item => item !== label)
}
