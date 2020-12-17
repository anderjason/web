export function currentHostIsLocal(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const { hostname } = window.location;

  return hostname === "localhost" || hostname.startsWith("192.");
}
