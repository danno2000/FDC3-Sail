import type { BrowserTypes } from "@finos/fdc3"

const DEFAULT_BRIDGE_ORIGIN = "http://localhost:5180"

function flagOn(value: unknown): boolean {
  return typeof value === "string" && /^(1|true|yes)$/i.test(value.trim())
}

export function desktopBridgeOrigin(): string {
  const configured = import.meta.env.VITE_DESKTOP_BRIDGE_ORIGIN
  if (typeof configured === "string" && configured.length > 0) {
    return configured.replace(/\/+$/, "")
  }
  const https = flagOn(import.meta.env.VITE_DEMO_HTTPS)
  return https ? "https://localhost:5180" : DEFAULT_BRIDGE_ORIGIN
}

export function fdc3OpenProtocolUrl(appId: string): string {
  return `fdc3://open?appId=${encodeURIComponent(appId)}`
}

/**
 * Ask Desktop Bridge to open a known native App Directory app.
 * Body matches FDC3 / DACP `openRequest` (`app` + optional `context`).
 */
export async function openNativeViaBridge(
  payload: BrowserTypes.OpenRequestPayload,
): Promise<BrowserTypes.AppIdentifier> {
  const origin = desktopBridgeOrigin()
  try {
    const response = await fetch(`${origin}/fdc3/open`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    })
    const body = (await response.json()) as {
      payload?: { appIdentifier?: BrowserTypes.AppIdentifier; error?: string; message?: string }
    }
    if (!response.ok) {
      throw new Error(
        body.payload?.message ?? body.payload?.error ?? `Native open failed (${response.status})`,
      )
    }
    const identifier = body.payload?.appIdentifier
    if (!identifier?.appId) {
      throw new Error("Desktop Bridge did not return an appIdentifier")
    }
    return identifier
  } catch (error) {
    if (!(error instanceof TypeError)) {
      throw error
    }
    const protocol = fdc3OpenProtocolUrl(payload.app.appId)
    const fallback = window.open(protocol)
    if (fallback) {
      return {
        appId: payload.app.appId,
        instanceId: payload.app.instanceId ?? crypto.randomUUID(),
      }
    }
    throw new Error(`Failed to open native app ${payload.app.appId} at ${origin}`)
  }
}
