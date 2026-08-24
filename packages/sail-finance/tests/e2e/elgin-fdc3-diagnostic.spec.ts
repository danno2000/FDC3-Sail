import { test, expect, type Frame } from "@playwright/test"

/** Open the app directory sheet and launch a demo app by title. */
async function launchDemoApp(page: import("@playwright/test").Page, title: string, port: number) {
  if (page.frames().some(f => f.url().includes(`:${port}`))) return

  const browse = page.getByRole("button", { name: /Browse App Directory/i })
  if (await browse.isVisible()) {
    await browse.click()
  } else {
    await page.evaluate(() => {
      const trigger = document.querySelector('[data-slot="sidebar-trigger"]') as HTMLElement | null
      trigger?.click()
      const apps = Array.from(document.querySelectorAll('[data-sidebar="menu-button"]')).find(el =>
        el.textContent?.includes("Apps"),
      ) as HTMLElement | undefined
      apps?.click()
    })
  }

  await expect(page.getByRole("heading", { name: "App Directory" })).toBeVisible()
  await page.getByText(title, { exact: false }).first().click()
  await page.waitForTimeout(2500)
}

function frameForPort(page: import("@playwright/test").Page, port: number): Frame | undefined {
  return page.frames().find(f => f.url().includes(`:${port}`))
}

test.describe("Elgin demo FDC3 via getAgent()", () => {
  test.setTimeout(60_000)

  test("asset-screener broadcasts fdc3.instrument to risk-engine under Sail", async ({ page, context }) => {
    await context.clearCookies()
    await page.goto("/")
    await page.evaluate(() => localStorage.clear())
    await page.reload({ waitUntil: "networkidle" })

    await launchDemoApp(page, "Asset Screener", 5173)
    await launchDemoApp(page, "Risk Engine", 5174)

    const screener = frameForPort(page, 5173)
    const risk = frameForPort(page, 5174)
    expect(screener, "asset-screener iframe should load").toBeTruthy()
    expect(risk, "risk-engine iframe should load").toBeTruthy()

    await page.waitForTimeout(2000)

    await screener!.evaluate(() => {
      const row = [...document.querySelectorAll("tr")].find(r => r.textContent?.includes("VOW3"))
      row?.querySelector<HTMLInputElement>("input[type=checkbox]")?.click()
      ;[...document.querySelectorAll("button")]
        .find(b => b.textContent?.includes("Add to Proposed Trades"))
        ?.click()
    })

    await page.waitForTimeout(2000)

    const riskAltCount = await risk!.evaluate(() =>
      typeof window.getAlternatives === "function" ? window.getAlternatives().length : -1,
    )
    expect(riskAltCount, "risk-engine should receive EQ_VOW3 from asset-screener").toBeGreaterThan(0)
  })
})
