export function currentHostIsLocal(): boolean {
  const { hostname } = window.location;

  return hostname === "localhost" || hostname.startsWith("192.");
}
