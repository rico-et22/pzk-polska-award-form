import { BANDS, type QsoRow } from "../../schemas/applicationSchema.ts";

const BAND_ORDER_MAP: Record<string, number> = {};
BANDS.forEach((band, index) => {
  BAND_ORDER_MAP[band] = index;
});

/**
 * Sorts QSO contacts according to PZK Polska Award Rule 6:
 * 1. Firstly by Voivodeship code (alphabetical, unassigned at the end)
 * 2. Secondly by Band (160m -> 80m -> 40m -> ... -> 70cm)
 * 3. Thirdly by Date (ascending)
 * 4. Fourthly by Callsign (alphabetical)
 */
export function sortQsoContacts(contacts: QsoRow[]): QsoRow[] {
  return [...contacts].sort((a, b) => {
    // 1. Voivodeship
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

    // 3. Date
    if (a.date !== b.date) {
      return (a.date || "").localeCompare(b.date || "");
    }

    // 4. Callsign
    return (a.callsign || "").localeCompare(b.callsign || "");
  });
}
