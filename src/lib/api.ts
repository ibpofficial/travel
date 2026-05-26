export function getApiUrl(path: string): string {
  // If we are on GitHub Pages or any other custom domain, we route requests to the live Cloud Run backend URL
  if (typeof window !== "undefined" && window.location.hostname.includes("github.io")) {
    const liveBackend = "https://ais-pre-ltqgelgjksbmvapus5kfav-895503151118.asia-southeast1.run.app";
    return `${liveBackend}${path}`;
  }
  return path;
}
