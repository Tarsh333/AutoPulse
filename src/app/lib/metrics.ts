import { MetricSeries } from "../api/documents";

export interface MetricInterpretation {
  status: "normal" | "high" | "low" | "unknown";
  statusLabel: string;
  trend: "improving" | "worsening" | "stable" | "none";
  trendLabel: string;
}

// Parses "13.0-17.0" / "70 - 100" into [min, max]; null if not parseable.
export function parseRange(range?: string): [number, number] | null {
  if (!range) return null;
  const m = range.match(/(-?\d+(?:\.\d+)?)\s*[-–to]+\s*(-?\d+(?:\.\d+)?)/i);
  if (!m) return null;
  const min = Number(m[1]);
  const max = Number(m[2]);
  if (Number.isNaN(min) || Number.isNaN(max)) return null;
  return min <= max ? [min, max] : [max, min];
}

// How far a value sits outside the healthy range (0 when inside).
function outOfRange(v: number, min: number, max: number): number {
  if (v < min) return min - v;
  if (v > max) return v - max;
  return 0;
}

export function interpretSeries(series: MetricSeries): MetricInterpretation {
  const pts = series.points;
  if (pts.length === 0) {
    return { status: "unknown", statusLabel: "No data", trend: "none", trendLabel: "" };
  }

  const latest = pts[pts.length - 1].value;
  const range = parseRange(series.reference_range);

  // Current status vs reference range.
  let status: MetricInterpretation["status"] = "unknown";
  let statusLabel = "No reference range";
  if (range) {
    const [min, max] = range;
    if (latest < min) {
      status = "low";
      statusLabel = "Below normal range";
    } else if (latest > max) {
      status = "high";
      statusLabel = "Above normal range";
    } else {
      status = "normal";
      statusLabel = "Within normal range";
    }
  }

  // Trend: compare how far out-of-range the last two readings are.
  let trend: MetricInterpretation["trend"] = "none";
  let trendLabel = "Only one reading";
  if (pts.length >= 2) {
    const prev = pts[pts.length - 2].value;
    if (range) {
      const [min, max] = range;
      const prevBad = outOfRange(prev, min, max);
      const latestBad = outOfRange(latest, min, max);
      if (latestBad === 0 && prevBad === 0) {
        trend = "stable";
        trendLabel = "Staying in range";
      } else if (latestBad < prevBad) {
        trend = "improving";
        trendLabel = "Improving";
      } else if (latestBad > prevBad) {
        trend = "worsening";
        trendLabel = "Worsening";
      } else {
        trend = "stable";
        trendLabel = "Stable";
      }
    } else {
      // No range — just report direction, no judgement.
      const delta = latest - prev;
      trend = "stable";
      trendLabel =
        delta > 0 ? "Trending up" : delta < 0 ? "Trending down" : "Stable";
    }
  }

  return { status, statusLabel, trend, trendLabel };
}
