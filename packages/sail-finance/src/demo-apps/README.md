# Elgin demo apps — translation notes

`elgin-demo-appd.json` is derived from two files in the `fdc3-demo-apps` repo:

- `packages/here-provider/public/app-directory.json` — the HERE/OpenFin app directory
- `packages/here-provider/HERE.json` — the OpenFin platform manifest (window layout)

Neither is the source of truth for what `npm run demo` serves, so the records here are
reconciled against the apps' actual FDC3 calls. This file records what was carried over,
what was deliberately dropped, and why.

## Scope

`npm run demo` starts seven vite servers: `asset-screener` (5173), `risk-engine` (5174),
`order-management` (5175), `portfolio` (5178), `here-provider` (5179),
`desktop-bridge` (5180) and `teams-adapter` (5181). Six are listed here. `here-provider` is the OpenFin platform
provider, not an app — it only serves the HERE manifest and the shared icon.

`npm run dev` additionally starts `charts` (5176) and `news` (5177). Both are outside the
demo script and are not listed; `news` uses FDC3, `charts` does not.

## Carried over

| Source field | Here |
| --- | --- |
| `appId` | `appId`, unchanged |
| `name` | `title` (Sail requires `title`; the source records have none) and a space-free `name` |
| `url` | `details.url` — the source uses the flat pre-2.0 shape, Sail expects FDC3 2.x `details` |
| `description` | `description`, unchanged for `order-management` and `desktop-bridge` |

`asset-screener`, `risk-engine` and `portfolio` are **not** in the source directory at HEAD
— they were dropped from it when the CRD interop entries were added. Their records here are
written from the apps' source.

## Contexts

The source directory carries no `interop` block, so channel contexts were read off the code:

| App | Broadcasts | Listens for |
| --- | --- | --- |
| `asset-screener` | `fdc3.instrument` | `fdc3.instrument` |
| `risk-engine` | `fdc3.instrument`, `elginwhite.riskAssessment` | `fdc3.instrument` on the user channel; `ViewRisk` returns the current book as `elginwhite.riskProfile` (VaR, sensitivities, stress, factors). A ticker is optional; the result is always fund-level, not single-name. |
| `order-management` | `fdc3.order`, `fdc3.instrument` | `elginwhite.tradeProposals`, `fdc3.instrument` |
| `ms-teams` | `fdc3.instrument` | `fdc3.instrument` |

`elginwhite.tradeProposals` has no producer in the repo — it arrives from the external WPF
app over `desktop-bridge` as a DACP `broadcastRequest`.

## Deliberately dropped

**`SubmitTrades` intent on `order-management`.** The source directory declares
`{ "name": "SubmitTrades", "contexts": ["elginwhite.tradeProposals"] }`, but no app in the
repo calls `addIntentListener` — `order-management` receives trade proposals through
`addContextListener("elginwhite.tradeProposals", …)`, i.e. a channel broadcast. Declaring
`interop.intents.listensFor` would make Sail's resolver offer the app as a `raiseIntent`
target that never answers. The declaration belongs back once the app registers a real intent
listener.

The same applies to the earlier intent sets in the directory's git history (`ViewInstrument`,
`ViewAnalytics`, `ViewRisk`, `ViewOrder`, `ManageOrders`, `ViewPortfolio`, and the `pms`/`oms`
`CreateOrder` pair in the deleted root `fdc3-app-directory.json`). None were ever implemented.

**`crd-interop-tester`** (`http://127.0.0.1:8081/ElginWhite.Interop.Web/crd-interop-tester.html`).
An externally hosted IIS app, not started by `npm run demo`. Its four intents (`ViewNews`,
`ViewChart`, `ViewBond`, `SubscribePricing`) are likewise unimplemented on this side.

**`elginwhite-crd-mock`** (`type: native`, `details.path: ElginWhite.Mock.CRD.exe`). Sail's
`appLauncher` in `main.tsx` requires `details.url` and throws otherwise, so a native record
would list in the launcher and fail on open. The mock participates through `desktop-bridge`
rather than by being launched.

**`test-desktop-app`** (`http://localhost:5180/adapter.html?app=test-desktop-app`). Stale on
two counts: the bridge serves `iframe-proxy.html`, not `adapter.html`, and it spawns those
frames itself per connected desktop app — they are internal plumbing, not launchable apps.

**HERE.json window geometry** (1200×900 for the three finance apps, 800×600 for the bridge,
and the four-window grouping). Sail lays apps out as dockview panels inside one shell; there
is no per-app sizing in `DirectoryApp` and Sail reads no `hostManifests` key for it.

## The one behavioural gap

HERE.json marks every view `"fdc3InteropApi": "2.0"`, which is OpenFin's instruction to
inject `window.fdc3` into the view. That is why `asset-screener`, `risk-engine` and
`order-management` all guard on `window.fdc3` and return early when it is absent.

Sail's browser Desktop Agent does not inject that global — apps reach it through the WCP
`postMessage` handshake that `getAgent()` initiates. The Elgin demo apps (`asset-screener`,
`risk-engine`, `order-management`) connect via `@finos/fdc3` `getAgent()` through the shared
`sd-ui` helper (`connectFdc3`, `broadcastContext`, `addContextListener`).
