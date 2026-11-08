/**
 * Bwana Failed Search Logging & Telemetry
 * Captures zero-result user queries to continuously train the synonym engine.
 */

export interface FailedSearchLog {
  query: string;
  locationArea: string;
  radiusKm: number;
  timestamp: string;
}

const failedSearchBuffer: FailedSearchLog[] = [];

export function logFailedSearch(query: string, locationArea: string, radiusKm: number): void {
  if (!query || !query.trim()) return;

  const entry: FailedSearchLog = {
    query: query.trim(),
    locationArea,
    radiusKm,
    timestamp: new Date().toISOString(),
  };

  failedSearchBuffer.unshift(entry);
  if (failedSearchBuffer.length > 100) {
    failedSearchBuffer.pop();
  }

  // Telemetry output for developer review & daily synonym additions
  if (import.meta.env.DEV) {
    console.info(`[Bwana Search Analytics] Zero Results Query Logged: "${query}" in ${locationArea} (${radiusKm}km). Adding to synonym backlog.`);
  }
}

export function getRecentFailedSearches(): FailedSearchLog[] {
  return [...failedSearchBuffer];
}
