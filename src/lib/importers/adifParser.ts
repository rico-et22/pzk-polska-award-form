import { type QsoRow, qsoRowSchema } from "../../schemas/applicationSchema.ts";
import {
  normalizeBand,
  normalizeMode,
  normalizeVoivodeship,
  normalizeDate,
} from "./voivodeshipHelper.ts";

export interface AdifParseResult {
  contacts: QsoRow[];
  totalParsed: number;
  validCount: number;
  skippedCount: number;
  errors: string[];
}

/**
 * Parses ADIF text into validated QsoRow items.
 */
export function parseAdif(adifContent: string): AdifParseResult {
  const result: AdifParseResult = {
    contacts: [],
    totalParsed: 0,
    validCount: 0,
    skippedCount: 0,
    errors: [],
  };

  if (!adifContent || !adifContent.trim()) {
    return result;
  }

  // Strip header before <EOH> (case insensitive) if present
  let body = adifContent;
  const eohIndex = adifContent.search(/<eoh>/i);
  if (eohIndex !== -1) {
    const eohEnd = adifContent.indexOf(">", eohIndex);
    body = adifContent.substring(eohEnd + 1);
  }

  // Split into raw records by <EOR>
  const rawRecords = body.split(/<eor>/i);

  for (let i = 0; i < rawRecords.length; i++) {
    const recStr = rawRecords[i].trim();
    if (!recStr) continue;

    result.totalParsed++;

    // Parse key-value pairs from the record
    const fields: Record<string, string> = {};
    const tagRegex = /<([a-zA-Z0-9_]+)(?::(\d+))?(?::([a-zA-Z0-9_]+))?>/g;
    let match: RegExpExecArray | null;

    while ((match = tagRegex.exec(recStr)) !== null) {
      const tagName = match[1].toUpperCase();
      const length = match[2] ? parseInt(match[2], 10) : undefined;
      const valStartIndex = tagRegex.lastIndex;

      let val = "";
      if (length !== undefined && !isNaN(length)) {
        val = recStr.substr(valStartIndex, length);
        // Move regex cursor forward
        tagRegex.lastIndex = valStartIndex + length;
      } else {
        // Untyped / no-length fallback: read until next tag or end
        const nextTagIndex = recStr.indexOf("<", valStartIndex);
        if (nextTagIndex === -1) {
          val = recStr.substring(valStartIndex);
        } else {
          val = recStr.substring(valStartIndex, nextTagIndex);
        }
      }

      fields[tagName] = val.trim();
    }

    // Extract callsign
    const rawCall = fields.CALL || fields.OPERATOR || "";
    const cleanCall = rawCall.toUpperCase().replace(/[^A-Z0-9/]/g, "");

    // Extract date
    const rawDate = fields.QSO_DATE || fields.QSO_DATE_OFF || "";
    const cleanDate = normalizeDate(rawDate);

    // Extract band & frequency
    const rawBand = fields.BAND || "";
    const rawFreq = fields.FREQ || fields.FREQ_RX || "";
    const cleanBand = normalizeBand(rawBand, rawFreq);

    // Extract mode & submode
    const rawMode = fields.MODE || "";
    const rawSubmode = fields.SUBMODE || "";
    const cleanMode = normalizeMode(rawMode, rawSubmode);

    // Extract voivodeship from various possible ADIF fields
    let cleanVoivodeship =
      normalizeVoivodeship(fields.STATE) ||
      normalizeVoivodeship(fields.MY_STATE) ||
      normalizeVoivodeship(fields.CNTY) ||
      normalizeVoivodeship(fields.PROPCF_VOIVODESHIP) ||
      normalizeVoivodeship(fields.SP_STATE) ||
      "";

    // If voivodeship still not found, check COMMENT or NOTES or QSLMSG for PGA / woj
    const rawRemarks = fields.COMMENT || fields.NOTES || fields.QSLMSG || fields.PGA || "";
    if (!cleanVoivodeship && rawRemarks) {
      // Look for patterns like [D], Woj: D, PGA: WR01
      const wojMatch = rawRemarks.match(/(?:woj(?:ewodztwo)?\.?|state|pga)[:\s]*([a-zA-Z]{1,3})/i);
      if (wojMatch) {
        cleanVoivodeship = normalizeVoivodeship(wojMatch[1]);
      } else {
        // Check single letter in brackets e.g. (D) or [D]
        const bracketMatch = rawRemarks.match(/[\[(]([A-Za-z])[\])]/);
        if (bracketMatch) {
          cleanVoivodeship = normalizeVoivodeship(bracketMatch[1]);
        }
      }
    }

    const candidate: QsoRow = {
      callsign: cleanCall,
      date: cleanDate,
      band: cleanBand,
      mode: cleanMode,
      voivodeship: cleanVoivodeship,
      remarks: rawRemarks,
    };

    // Validate candidate
    const validation = qsoRowSchema.safeParse(candidate);
    if (validation.success) {
      result.contacts.push(validation.data);
      result.validCount++;
    } else {
      result.skippedCount++;
      if (cleanCall || cleanDate) {
        result.errors.push(
          `Record #${result.totalParsed} (${cleanCall || "unknown call"}, ${cleanDate || "no date"}): ${validation.error.issues.map((i) => i.message).join(", ")}`
        );
      }
    }
  }

  return result;
}
