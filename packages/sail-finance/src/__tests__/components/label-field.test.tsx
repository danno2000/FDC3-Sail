import { describe, test, expect } from "vite-plus/test"
import userEvent from "@testing-library/user-event"

import { LabelField } from "../../components/ui/label-field"
import { render, screen } from "../utils/test-utils"

describe("LabelField", () => {
  test("adds a freeform label on Enter and removes it from the badge", async () => {
    const user = userEvent.setup()
    const labels: string[] = []
    const onChange = (next: string[]) => {
      labels.splice(0, labels.length, ...next)
    }

    const view = render(
      <LabelField value={labels} onChange={next => onChange(next)} aria-label="Filter labels" />,
    )

    const input = screen.getByRole("combobox", { name: "Filter labels" })
    await user.type(input, "charts{Enter}")
    view.rerender(
      <LabelField
        value={[...labels]}
        onChange={next => onChange(next)}
        aria-label="Filter labels"
      />,
    )

    expect(labels).toEqual(["charts"])
    expect(screen.getByText("charts")).toBeTruthy()

    await user.click(screen.getByRole("button", { name: "Remove charts" }))
    view.rerender(
      <LabelField
        value={[...labels]}
        onChange={next => onChange(next)}
        aria-label="Filter labels"
      />,
    )

    expect(labels).toEqual([])
    expect(screen.queryByText("charts")).toBeNull()
  })

  test("filters typeahead suggestions and adds the highlighted option", async () => {
    const user = userEvent.setup()
    let labels: string[] = []

    const view = render(
      <LabelField
        value={labels}
        onChange={next => {
          labels = next
        }}
        suggestions={["ViewChart", "ViewInstrument", "StartChat"]}
        aria-label="Filter labels"
      />,
    )

    const input = screen.getByRole("combobox", { name: "Filter labels" })
    await user.type(input, "view")

    expect(screen.getByRole("option", { name: "ViewChart" })).toBeTruthy()
    expect(screen.getByRole("option", { name: "ViewInstrument" })).toBeTruthy()
    expect(screen.queryByRole("option", { name: "StartChat" })).toBeNull()

    await user.click(screen.getByRole("option", { name: "ViewChart" }))
    view.rerender(
      <LabelField
        value={labels}
        onChange={next => {
          labels = next
        }}
        suggestions={["ViewChart", "ViewInstrument", "StartChat"]}
        aria-label="Filter labels"
      />,
    )

    expect(labels).toEqual(["ViewChart"])
    expect(screen.getByText("ViewChart")).toBeTruthy()
  })

  test("does not add duplicate labels", async () => {
    const user = userEvent.setup()
    let labels = ["web"]

    render(
      <LabelField
        value={labels}
        onChange={next => {
          labels = next
        }}
        aria-label="Filter labels"
      />,
    )

    const input = screen.getByRole("combobox", { name: "Filter labels" })
    await user.type(input, "Web{Enter}")

    expect(labels).toEqual(["web"])
  })

  test("Backspace on an empty query removes the last label", async () => {
    const user = userEvent.setup()
    let labels = ["web", "charts"]

    const view = render(
      <LabelField
        value={labels}
        onChange={next => {
          labels = next
        }}
        aria-label="Filter labels"
      />,
    )

    const input = screen.getByRole("combobox", { name: "Filter labels" })
    await user.click(input)
    await user.keyboard("{Backspace}")
    view.rerender(
      <LabelField
        value={labels}
        onChange={next => {
          labels = next
        }}
        aria-label="Filter labels"
      />,
    )

    expect(labels).toEqual(["web"])
  })
})
