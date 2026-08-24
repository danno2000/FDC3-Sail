/**
 * Elgin demo applications (the apps `npm run demo` serves from the fdc3-demo-apps repo).
 *
 * The records are held as an FDC3 App Directory document rather than a hosted `/v2/apps`
 * endpoint so the launcher is populated even when the demo dev servers are not running —
 * launching an app that is down simply yields an empty panel instead of the app vanishing
 * from the directory.
 *
 * The demo servers bind fixed ports (`strictPort: true` in each package's vite config), so
 * the URLs are stable. `VITE_DEMO_APPS_ORIGIN` retargets them as a set for the case where
 * the demo repo is served from somewhere other than localhost.
 */

import type { DirectoryApp } from "@finos/sail-desktop-agent"

import demoAppDirectory from "./elgin-demo-appd.json"

/** Host the demo vite servers bind by default. Port is preserved when retargeting. */
const DEMO_APPS_DEFAULT_ORIGIN_HOST = "localhost"

function retargetHost(app: DirectoryApp, host: string): DirectoryApp {
  const rewrite = (value: string): string => {
    try {
      const url = new URL(value)
      if (url.hostname !== DEMO_APPS_DEFAULT_ORIGIN_HOST) {
        return value
      }
      url.hostname = host
      return url.toString()
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
 */
export function loadDemoApplications(options?: { host?: string }): DirectoryApp[] {
  const apps = structuredClone(demoAppDirectory.applications as DirectoryApp[])
  const host = options?.host ?? import.meta.env.VITE_DEMO_APPS_HOST

  return typeof host === "string" && host.length > 0 && host !== DEMO_APPS_DEFAULT_ORIGIN_HOST
    ? apps.map(app => retargetHost(app, host))
    : apps
}
