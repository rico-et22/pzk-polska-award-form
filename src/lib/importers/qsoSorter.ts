import { BANDS, type QsoRow } from "../../schemas/applicationSchema.ts";

const BAND_ORDER_MAP: Record<string, number> = {};
BANDS.forEach((band, index) => {
  BAND_ORDER_MAP[band] = index;
});

/**
 * Sorts QSO contacts according to PZK Polska Award Rule 6:
 * 1. Firstly by Voivodeship code (alphabetical: B, C, D, F, G, J, K, L, M, O, P, R, S, U, W, Z, unassigned at the end)
 * 2. Secondly by Band (160m -> 80m -> 40m -> 30m -> 20m -> 17m -> 15m -> 12m -> 10m -> 6m -> 2m -> 70cm)
 * 3. Thirdly by Callsign (alphabetical)
 * 4. Fourthly by Date (chronological)
 */
export function sortQsoContacts(contacts: QsoRow[]): QsoRow[] {
  return [...contacts].sort((a, b) => {
    // 1. Voivodeship code
    const voyA = (a.voivodeship || "").trim().toUpperCase();
    const voyB = (b.voivodeship || "").trim().toUpperCase();

    if (voyA !== voyB) {
      if (!voyA) return 1; // Empty voivodeship goes to bottom
      if (!voyB) return -1;
      return voyA.localeCompare(voyB);
    }

    // 2. Band
    const bandRankA = BAND_ORDER_MAP[a.band] ?? 999;
    const bandRankB = BAND_ORDER_MAP[b.band] ?? 999;
    if (bandRankA !== bandRankB) {
      return bandRankA - bandRankB;
    }

    // 3. Callsign
    const callA = (a.callsign || "").trim().toUpperCase();
    const callB = (b.callsign || "").trim().toUpperCase();
    if (callA !== callB) {
      return callA.localeCompare(callB);
    }

    // 4. Date
    return (a.date || "").localeCompare(b.date || "");
  });
}
