import { describe, test, expect } from "vite-plus/test"
import userEvent from "@testing-library/user-event"

import { LabelSearch } from "../../components/label-search"
import { render, screen } from "../utils/test-utils"

const items = [
  { name: "Charts", tags: "trading" },
  { name: "News", tags: "research" },
]

describe("LabelSearch", () => {
  test("renders the label field and filters items through the render prop", async () => {
    const user = userEvent.setup()

    render(
      <LabelSearch
        items={items}
        match={(item, labels) =>
          labels.every(
            label =>
              item.tags.includes(label.toLowerCase()) ||
              item.name.toLowerCase().includes(label.toLowerCase()),
          )
        }
        suggestions={["trading", "research"]}
        aria-label="Filter labels"
      >
        {({ filtered, field }) => (
          <>
            {field}
            <ul>
              {filtered.map(item => (
                <li key={item.name}>{item.name}</li>
              ))}
            </ul>
          </>
        )}
      </LabelSearch>,
    )

    expect(screen.getByText("Charts")).toBeTruthy()
    expect(screen.getByText("News")).toBeTruthy()

    const input = screen.getByRole("combobox", { name: "Filter labels" })
    await user.type(input, "trading{Enter}")

    expect(screen.getByText("trading")).toBeTruthy()
    expect(screen.getByText("Charts")).toBeTruthy()
    expect(screen.queryByText("News")).toBeNull()
  })
})
