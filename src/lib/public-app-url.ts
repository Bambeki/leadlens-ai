const PROTECTED_VERCEL_DEPLOYMENT_HOST =
  /(?:^|\.)bambekis-projects\.vercel\.app$/i;

const ABSOLUTE_URL_RE = /^https?:\/\//i;

export function normalizePublicAppBaseUrl(value: string | undefined | null): string {
  if (!value) return "";
  const trimmed = value.trim().replace(/\/+$/, "");
  if (!trimmed) return "";

  const withProtocol = ABSOLUTE_URL_RE.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    return `${url.protocol}//${url.host}`;
  } catch {
    return "";
  }
}

export function isProtectedVercelDeploymentHost(hostname: string): boolean {
  return PROTECTED_VERCEL_DEPLOYMENT_HOST.test(hostname);
}

export function isSafeLocalDevelopmentOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    return url.hostname === "localhost" || url.hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

function hostnameFromOrigin(origin: string): string {
  try {
    return new URL(origin).hostname;
  } catch {
    return "";
  }
}

/**
 * Canonical origin for customer-facing links.
 * Production always prefers NEXT_PUBLIC_APP_URL.
 * Request / window origin is only a local-development fallback.
 */
export function getPublicAppBaseUrl(runtimeOrigin?: string): string {
  const configured = normalizePublicAppBaseUrl(process.env.NEXT_PUBLIC_APP_URL);
  if (configured) {
    const host = hostnameFromOrigin(configured);
    if (host && isProtectedVercelDeploymentHost(host)) {
      return "";
    }
    return configured;
  }

  const runtime = normalizePublicAppBaseUrl(runtimeOrigin);
  if (runtime && isSafeLocalDevelopmentOrigin(runtime)) {
    return runtime;
  }

  if (typeof window !== "undefined") {
    const windowOrigin = normalizePublicAppBaseUrl(window.location.origin);
    if (windowOrigin && isSafeLocalDevelopmentOrigin(windowOrigin)) {
      return windowOrigin;
    }
  }

  return "";
}

export function toCanonicalAbsoluteUrl(pathOrUrl: string, runtimeOrigin?: string): string {
  const base = getPublicAppBaseUrl(runtimeOrigin);
  const value = pathOrUrl.trim();
  if (!value) return base;

  if (ABSOLUTE_URL_RE.test(value)) {
    return canonicalizeCustomerFacingUrl(value, base) || value;
  }

  if (!base) return value;
  return `${base}${value.startsWith("/") ? value : `/${value}`}`;
}

export function containsProtectedVercelDeploymentUrl(content: string): boolean {
  return /https?:\/\/[a-z0-9.-]*bambekis-projects\.vercel\.app/i.test(content);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function canonicalizeCustomerFacingUrl(absoluteUrl: string, canonicalBase: string): string {
  if (!canonicalBase) return absoluteUrl;
  try {
    const url = new URL(absoluteUrl);
    if (isProtectedVercelDeploymentHost(url.hostname) || url.origin !== canonicalBase) {
      if (url.pathname.startsWith("/r/")) {
        return `${canonicalBase}${url.pathname}${url.search}${url.hash}`;
      }
    }
    return absoluteUrl;
  } catch {
    return absoluteUrl;
  }
}

/** Rewrite absolute /r/{token} links onto the canonical public origin, keeping query strings. */
export function canonicalizeCustomerFacingContent(
  content: string,
  token: string
): string {
  const base = getPublicAppBaseUrl();
  if (!base || !token) return content;

  const path = `/r/${token}`;
  const escapedPath = escapeRegExp(path);
  const absolutePattern = new RegExp(
    `https?:\\/\\/[a-zA-Z0-9.-]+(?::\\d+)?${escapedPath}`,
    "g"
  );

  let next = content.replace(absolutePattern, `${base}${path}`);
  next = next.replace(
    new RegExp(`(^|["'\\s>(])${escapedPath}`, "gm"),
    `$1${base}${path}`
  );
  return next;
}
