import { useState, useCallback } from "react";

export interface LapData {
  lap: number;
  time: string;
  venue: string;
  date: string;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minuten

interface CacheEntry {
  data: LapData[];
  timestamp: number;
}

const dataCache = new Map<string, CacheEntry>();

function getCacheKey(transponder: string, filter: string): string {
  return `${transponder}|${filter}`;
}

function getCachedData(transponder: string, filter: string, ttlMs: number): LapData[] | null {
  if (ttlMs <= 0) return null;
  const key = getCacheKey(transponder, filter);
  const entry = dataCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > ttlMs) {
    dataCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCachedData(transponder: string, filter: string, data: LapData[]): void {
  const key = getCacheKey(transponder, filter);
  dataCache.set(key, { data, timestamp: Date.now() });
}

export interface UseLiveLapsDataParams {
  transponder?: string;
  filter?: "ALLEMAAL" | "BESTE" | "SLECHTSTE";
  /** getData2.php (live VinkSite data) of legacy ashx endpoints */
  endpoint?: "getData2" | "LapsData" | "LapsGrafieken";
  /** Override URL voor tests */
  baseUrl?: string;
  /** Cache TTL in ms. Standaard 5 min. 0 = cache uitschakelen */
  cacheTtlMs?: number;
}

/** Mock response voor tests - vervang met echte response voor integratietests */
export const MOCK_VINK_RESPONSE = `[
  {"lap":1,"time":"42.3","venue":"Binnen","date":"2025-01-15"},
  {"lap":2,"time":"41.8","venue":"Binnen","date":"2025-01-15"},
  {"lap":3,"time":"43.1","venue":"Buiten","date":"2025-01-15"}
]`;

/**
 * Parse getData2.php response: ;date;time;lap_time;venue_id per record.
 * Voorbeeld: ;2024-10-12;10:03:58;00:00.000;2838 ;2024-10-12;10:03:58;05:19.443;2838
 */
export function parseGetData2Format(raw: string): LapData[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];

  const parts = trimmed.split(";").map((p) => p.trim());
  const laps: LapData[] = [];
  // Skip leading empty (from ; at start), then groups of 4: date, time, lap_time, venue_id
  for (let i = 1; i + 3 < parts.length; i += 4) {
    const date = parts[i] ?? "";
    const lapTime = parts[i + 2] ?? "";
    const venueId = (parts[i + 3] ?? "").trim();
    if (!date || !lapTime) continue;
    // Skip session-start markers (00:00.000) als lap time - optioneel
    laps.push({
      lap: laps.length + 1,
      time: lapTime,
      venue: venueId ? `IJsbaan ${venueId}` : "",
      date,
    });
  }
  return laps;
}

/**
 * Parse VinkSite response: plain text, JSON, of tabel format.
 * Extract: lap nr, tijd (42.3), baan, datum
 */
export function parseVinkData(raw: string): LapData[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];

  // getData2.php semicolon format: ;date;time;lap_time;venue_id
  if (trimmed.includes(";") && /;?\d{4}-\d{2}-\d{2};/.test(trimmed)) {
    return parseGetData2Format(raw);
  }

  // 1. Probeer JSON
  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      return parseJsonToLaps(parsed);
    } catch {
      // Fall through naar andere formaten
    }
  }

  // 2. CSV/TSV (header + rows)
  const lines = trimmed.split(/\r?\n/);
  if (lines.length >= 2) {
    const sep = lines[0].includes("\t") ? "\t" : ",";
    const headers = lines[0].toLowerCase().split(sep).map((h) => h.trim());
    const lapIdx = headers.findIndex((h) => /lap|ronde|#/.test(h));
    const timeIdx = headers.findIndex((h) => /time|tijd|lap_time/.test(h));
    const venueIdx = headers.findIndex((h) => /venue|baan|ijsbaan/.test(h));
    const dateIdx = headers.findIndex((h) => /date|datum/.test(h));

    if (lapIdx >= 0 && timeIdx >= 0) {
      const laps: LapData[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(sep).map((c) => c.trim());
        const lap = parseInt(cols[lapIdx] ?? "0", 10);
        const time = cols[timeIdx] ?? "";
        const venue = venueIdx >= 0 ? (cols[venueIdx] ?? "") : "";
        const date = dateIdx >= 0 ? (cols[dateIdx] ?? "") : "";
        if (lap && time) laps.push({ lap, time, venue, date });
      }
      return laps;
    }
  }

  // 3. Simpele regel-per-lap (lap\t tijd\t baan\t datum)
  const simpleRows = lines.filter((l) => /^\d+[\t,].+/.test(l));
  if (simpleRows.length > 0) {
    return simpleRows
      .map((line) => {
        const parts = line.split(/[\t,]/).map((p) => p.trim());
        const lap = parseInt(parts[0] ?? "0", 10);
        const time = parts[1] ?? "";
        const venue = parts[2] ?? "";
        const date = parts[3] ?? "";
        return lap && time ? { lap, time, venue, date } : null;
      })
      .filter((r): r is LapData => r !== null);
  }

  return [];
}

function parseJsonToLaps(parsed: unknown): LapData[] {
  if (Array.isArray(parsed)) {
    return parsed
      .map((item) => parseJsonItem(item))
      .filter((r): r is LapData => r !== null);
  }
  if (parsed && typeof parsed === "object") {
    const obj = parsed as Record<string, unknown>;
    if (Array.isArray(obj.laps)) return parseJsonToLaps(obj.laps);
    if (Array.isArray(obj.data)) return parseJsonToLaps(obj.data);
    if (Array.isArray(obj.sessions)) {
      return (obj.sessions as unknown[]).flatMap((s) =>
        parseJsonToLaps((s as Record<string, unknown>).laps ?? s)
      );
    }
  }
  return [];
}

function parseJsonItem(item: unknown): LapData | null {
  if (!item || typeof item !== "object") return null;
  const o = item as Record<string, unknown>;
  const lap =
    typeof o.lap === "number"
      ? o.lap
      : typeof o.lap_num === "number"
        ? o.lap_num
        : typeof o.ronde === "number"
          ? o.ronde
          : parseInt(String(o.lap ?? o.lap_num ?? o.ronde ?? 0), 10) || 0;
  const time = String(o.time ?? o.lap_time ?? o.tijd ?? o.LapTime ?? "");
  const venue = String(o.venue ?? o.baan ?? o.ijsbaan ?? o.Venue ?? "");
  const date = String(o.date ?? o.datum ?? o.Date ?? "");
  if (!lap || !time) return null;
  return { lap, time, venue, date };
}

/** Exported voor tests */
export function buildFormBody(params: UseLiveLapsDataParams): string {
  const searchParams = new URLSearchParams();
  searchParams.set("Transp", params.transponder ?? "FZ-62579");
  searchParams.set("Filter", params.filter ?? "ALLEMAAL");
  searchParams.set("MinLaps", "0");
  searchParams.set("MaxLaps", "1000");
  return searchParams.toString();
}

function getEndpointUrl(params: UseLiveLapsDataParams): string {
  if (params.baseUrl) return params.baseUrl;
  if (params.endpoint === "getData2" || !params.endpoint) {
    const q = new URLSearchParams({
      uid: params.transponder ?? "FZ-62579",
      trmin: "0",
      nol: "0",
      olduid: "",
      version: "v9.9.275",
    });
    return `/api/vink/LapsSubs/getData2.php?${q}`;
  }
  const name =
    params.endpoint === "LapsGrafieken" ? "LapsGrafieken.ashx" : "LapsData.ashx";
  return `/api/vink/${name}`;
}

interface UseLiveLapsDataReturn {
  data: LapData[];
  loading: boolean;
  error: string | null;
  /** @param force - true = cache negeren en opnieuw ophalen */
  refetch: (force?: boolean) => Promise<void>;
}

export function useLiveLapsData(
  params: UseLiveLapsDataParams = {}
): UseLiveLapsDataReturn {
  const [data, setData] = useState<LapData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const url = getEndpointUrl(params);
  const cacheTtlMs = params.cacheTtlMs ?? CACHE_TTL_MS;
  const transponder = params.transponder ?? "FZ-62579";
  const filter = params.filter ?? "ALLEMAAL";

  const refetch = useCallback(
    async (force = false) => {
      if (!force && cacheTtlMs > 0) {
        const cached = getCachedData(transponder, filter, cacheTtlMs);
        if (cached !== null) {
          setData(cached);
          setError(null);
          return;
        }
      }

      setLoading(true);
      setError(null);
      try {
        const useGetData2 = params.endpoint === "getData2" || !params.endpoint;
        const response = await fetch(url, {
          method: useGetData2 ? "GET" : "POST",
          headers: {
            Accept: "text/plain, */*",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            ...(useGetData2
              ? { Referer: "https://vinksite.com/Laps.htm" }
              : {
                  "Content-Type": "application/x-www-form-urlencoded",
                  "X-Requested-With": "XMLHttpRequest",
                  Referer: "https://www.vinksite.com/",
                  Origin: "https://www.vinksite.com",
                }),
          },
          ...(useGetData2 ? {} : { body: buildFormBody(params) }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const text = await response.text();
        const laps = parseVinkData(text);
        setData(laps);
        if (cacheTtlMs > 0) {
          setCachedData(transponder, filter, laps);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Onbekende fout bij laden";
        setError(message);
        setData([]);
      } finally {
        setLoading(false);
      }
    },
    [url, transponder, filter, cacheTtlMs, params]
  );

  return { data, loading, error, refetch };
}
