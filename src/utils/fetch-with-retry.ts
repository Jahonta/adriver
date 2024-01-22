export function fetchWithRetry(url: URL, retriesLeft: number) {
  try {
    return fetch(url);
  } catch (err) {
    if (retriesLeft <= 0) {
      throw err;
    }
    return fetchWithRetry(url, retriesLeft - 1);
  }
}
