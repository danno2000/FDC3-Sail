/**
 * Elgin demo applications (the apps `npm run demo` serves from the fdc3-demo-apps repo).
 *
 * The records are held as an FDC3 App Directory document rather than a hosted `/v2/apps`
 * endpoint so the launcher is populated even when the demo dev servers are not running —
 * launching an app that is down simply yields an empty panel instead of the app vanishing
 * from the directory.
 *
 * The demo servers bind fixed ports (`strictPort: true` in each package's vite config), so
 * the URLs are stable. `VITE_DEMO_APPS_HOST` retargets the host. `VITE_DEMO_HTTPS` /
 * `DEMO_HTTPS` switches `http://` to `https://` — HTTP is the default.
 */

import type { DirectoryApp } from "@finos/sail-desktop-agent"

import demoAppDirectory from "./elgin-demo-appd.json"

/** Host the demo vite servers bind by default. Port is preserved when retargeting. */
const DEMO_APPS_DEFAULT_ORIGIN_HOST = "localhost"

function flagOn(value: unknown): boolean {
  return typeof value === "string" && /^(1|true|yes)$/i.test(value.trim())
}

function retarget(app: DirectoryApp, host: string | undefined, https: boolean): DirectoryApp {
  const rewrite = (value: string): string => {
    try {
      const url = new URL(value)
      if (url.hostname !== DEMO_APPS_DEFAULT_ORIGIN_HOST) {
        return value
      }
      let next = value
      if (host && host !== DEMO_APPS_DEFAULT_ORIGIN_HOST) {
        url.hostname = host
        next = url.toString()
      }
      return https ? next.replace(/^http:/, "https:") : next.replace(/^https:/, "http:")
    } catch {
      return value
    }
  }

  return {
    ...app,
    details: "url" in app.details ? { ...app.details, url: rewrite(app.details.url) } : app.details,
    icons: app.icons?.map(icon => (icon.src ? { ...icon, src: rewrite(icon.src) } : icon)),
  }
}

/**
 * Demo app records, ready to seed `SailDesktopAgent`'s `apps` option.
 *
 * @param options.host - Host serving the demo apps. Defaults to `VITE_DEMO_APPS_HOST`,
 *   then `localhost`.
 * @param options.https - When true, load demo apps over HTTPS. Defaults to
 *   `VITE_DEMO_HTTPS` / `DEMO_HTTPS`. HTTP is the default.
 */
export function loadDemoApplications(options?: { host?: string; https?: boolean }): DirectoryApp[] {
  const apps = structuredClone(demoAppDirectory.applications as DirectoryApp[])
  const host = options?.host ?? import.meta.env.VITE_DEMO_APPS_HOST
  const https = options?.https ?? flagOn(import.meta.env.VITE_DEMO_HTTPS)
  const hostChanged =
    typeof host === "string" && host.length > 0 && host !== DEMO_APPS_DEFAULT_ORIGIN_HOST

  return apps.map(app => retarget(app, hostChanged ? host : undefined, https))
}
