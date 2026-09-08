import type { DirectoryApp } from "../../types/common"

function intentNames(app: DirectoryApp): string[] {
  return Object.keys(app.interop?.intents?.listensFor ?? {})
}

export function searchableText(app: DirectoryApp): string {
  return [
    app.title,
    app.name,
    app.appId,
    app.description,
    app.type,
    app.publisher,
    ...(app.categories ?? []),
    ...intentNames(app),
  ]
    .filter((part): part is string => Boolean(part))
    .join(" ")
    .toLowerCase()
}

/** AND-match: every applied label must appear in the app's searchable fields. */
export function appMatchesLabels(app: DirectoryApp, labels: string[]): boolean {
  if (labels.length === 0) return true
  const text = searchableText(app)
  return labels.every(label => text.includes(label.trim().toLowerCase()))
}

/** Typeahead source: categories, app types, and intent names from the loaded directory. */
export function labelSuggestionsFromApps(apps: DirectoryApp[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []

  const add = (value: string | undefined) => {
    const trimmed = value?.trim()
    if (!trimmed) return
    const key = trimmed.toLowerCase()
    if (seen.has(key)) return
    seen.add(key)
    out.push(trimmed)
  }

  for (const app of apps) {
    for (const category of app.categories ?? []) add(category)
    add(app.type)
    for (const name of intentNames(app)) add(name)
  }

  return out.sort((a, b) => a.localeCompare(b))
}
