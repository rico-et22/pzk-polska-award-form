import { BANDS, MODES, VOIVODESHIPS } from "../../schemas/applicationSchema.ts";

// Set of valid 1-letter Polish voivodeship codes
const VALID_VOIVODESHIP_CODES = new Set<string>(
  VOIVODESHIPS.map((v) => v.code).filter(Boolean)
);

// Map of common aliases (2-letter ISO/SP codes, full Polish names) to 1-letter code
const VOIVODESHIP_ALIASES: Record<string, string> = {
  // Dolnośląskie
  D: "D",
  DS: "D",
  DOLNOSLASKIE: "D",
  DOLNOŚLĄSKIE: "D",
  "LOWER SILESIAN": "D",

  // Kujawsko-pomorskie
  P: "P",
  KP: "P",
  KUJAWSKOPOMORSKIE: "P",
  "KUJAWSKO-POMORSKIE": "P",
  KUYAVIAN: "P",

  // Lubelskie
  L: "L",
  LU: "L",
  LUB: "L",
  LUBELSKIE: "L",
  LUBLIN: "L",

  // Lubuskie
  B: "B",
  LB: "B",
  LBU: "B",
  LUBUSKIE: "B",
  LUBUSZ: "B",

  // Łódzkie
  C: "C",
  LD: "C",
  LOD: "C",
  LODZKIE: "C",
  ŁÓDZKIE: "C",
  LODZ: "C",

  // Małopolskie
  M: "M",
  MA: "M",
  MP: "M",
  MALOPOLSKIE: "M",
  MAŁOPOLSKIE: "M",
  "LESSER POLAND": "M",

  // Mazowieckie
  R: "R",
  MZ: "R",
  MAZ: "R",
  MAZOWIECKIE: "R",
  MASOVIAN: "R",

  // Opolskie
  U: "U",
  OP: "U",
  OPOLSKIE: "U",
  OPOLE: "U",

  // Podkarpackie
  K: "K",
  PK: "K",
  PDK: "K",
  PODKARPACKIE: "K",
  SUBCARPATHIAN: "K",

  // Podlaskie
  O: "O",
  PD: "O",
  PDL: "O",
  PODLASKIE: "O",
  PODLASIE: "O",

  // Pomorskie
  F: "F",
  PM: "F",
  POM: "F",
  POMORSKIE: "F",
  POMERANIAN: "F",

  // Śląskie
  G: "G",
  SL: "G",
  SLK: "G",
  SLASKIE: "G",
  ŚLĄSKIE: "G",
  SILESIAN: "G",

  // Świętokrzyskie
  S: "S",
  SK: "S",
  SWIETOKRZYSKIE: "S",
  ŚWIĘTOKRZYSKIE: "S",
  HOLY_CROSS: "S",

  // Warmińsko-mazurskie
  J: "J",
  WN: "J",
  WM: "J",
  WARMINSKOMAZURSKIE: "J",
  "WARMIŃSKO-MAZURSKIE": "J",
  VARMIA: "J",

  // Wielkopolskie
  W: "W",
  WP: "W",
  WLP: "W",
  WIELKOPOLSKIE: "W",
  "GREATER POLAND": "W",

  // Zachodniopomorskie
  Z: "Z",
  ZP: "Z",
  ZPM: "Z",
  ZACHODNIOPOMORSKIE: "Z",
  "ZACHODNIO-POMORSKIE": "Z",
  "WEST POMERANIAN": "Z",
};

/**
 * Normalizes any string representation of a Polish voivodeship into its 1-letter code (D, P, L, etc.)
 */
export function normalizeVoivodeship(raw?: string): string {
  if (!raw) return "";
  const trimmed = raw.trim().toUpperCase();
  const cleaned = trimmed.replace(/[-_/\s]/g, "");

  // 1. Check for common prefix patterns in CNTY or STATE, e.g. "PL-MZ", "SP-D", "PL-DS"
  const prefixMatch = trimmed.match(/^(?:PL|SP)[-_ ]?([A-Z0-9]{1,3})$/);
  if (prefixMatch && VOIVODESHIP_ALIASES[prefixMatch[1]]) {
    return VOIVODESHIP_ALIASES[prefixMatch[1]];
  }

  // 2. Direct match in alias map (e.g. "D", "DS", "MZ", "DOLNOSLASKIE", etc.)
  if (VOIVODESHIP_ALIASES[cleaned]) {
    return VOIVODESHIP_ALIASES[cleaned];
  }

  // 3. Exact 1-letter code match
  if (trimmed.length === 1 && VALID_VOIVODESHIP_CODES.has(trimmed)) {
    return trimmed;
  }

  // 4. For longer full name aliases (length >= 4), check if input starts with or contains the alias
  for (const [alias, code] of Object.entries(VOIVODESHIP_ALIASES)) {
    const aliasCleaned = alias.replace(/[-_/\s]/g, "").toUpperCase();
    if (aliasCleaned.length >= 4 && (cleaned.startsWith(aliasCleaned) || aliasCleaned.startsWith(cleaned))) {
      return code;
    }
  }

  return "";
}

/**
 * Normalizes band string or derives band from frequency in MHz.
 */
export function normalizeBand(rawBand?: string, freqMhz?: string | number): typeof BANDS[number] {
  if (rawBand) {
    const b = rawBand.trim().toLowerCase();
    if (b === "160m" || b === "160") return "160m";
    if (b === "80m" || b === "80") return "80m";
    if (b === "40m" || b === "40") return "40m";
    if (b === "30m" || b === "30") return "30m";
    if (b === "20m" || b === "20") return "20m";
    if (b === "17m" || b === "17") return "17m";
    if (b === "15m" || b === "15") return "15m";
    if (b === "12m" || b === "12") return "12m";
    if (b === "10m" || b === "10") return "10m";
    if (b === "6m" || b === "6") return "6m";
    if (b === "2m" || b === "2") return "2m";
    if (b === "70cm" || b === "70") return "70cm";
  }

  if (freqMhz) {
    const freq = typeof freqMhz === "string" ? parseFloat(freqMhz) : freqMhz;
    if (!isNaN(freq)) {
      if (freq >= 1.8 && freq <= 2.0) return "160m";
      if (freq >= 3.5 && freq <= 3.8) return "80m";
      if (freq >= 7.0 && freq <= 7.3) return "40m";
      if (freq >= 10.1 && freq <= 10.15) return "30m";
      if (freq >= 14.0 && freq <= 14.35) return "20m";
      if (freq >= 18.068 && freq <= 18.168) return "17m";
      if (freq >= 21.0 && freq <= 21.45) return "15m";
      if (freq >= 24.89 && freq <= 24.99) return "12m";
      if (freq >= 28.0 && freq <= 29.7) return "10m";
      if (freq >= 50.0 && freq <= 54.0) return "6m";
      if (freq >= 144.0 && freq <= 148.0) return "2m";
      if (freq >= 430.0 && freq <= 440.0) return "70cm";
    }
  }

  return "20m";
}

/**
 * Normalizes ADIF mode and submode to one of the form supported modes:
 * SSB, CW, FM, DIGI, FT8, FT4, RTTY, PSK, OTHER
 */
export function normalizeMode(rawMode?: string, rawSubmode?: string): typeof MODES[number] {
  const m = (rawMode || "").trim().toUpperCase();
  const sub = (rawSubmode || "").trim().toUpperCase();

  if (sub === "FT8" || m === "FT8") return "FT8";
  if (sub === "FT4" || m === "FT4") return "FT4";
  if (sub.includes("PSK") || m.includes("PSK") || m === "BPSK31" || m === "QPSK31") return "PSK";
  if (sub.includes("RTTY") || m.includes("RTTY")) return "RTTY";
  if (m === "CW") return "CW";
  if (m === "SSB" || m === "USB" || m === "LSB" || m === "AM" || m === "PHONE") return "SSB";
  if (m === "FM" || m === "NFM" || m === "WFM") return "FM";

  // Other digital modes
  const digiModes = [
    "DIGI", "DATA", "JS8", "JT65", "JT9", "MFSK", "SSTV", "OLIVIA",
    "DOMINO", "PACKET", "VARA", "ARDOP", "ROS", "SIM31", "Q65", "FST4", "MSK144"
  ];
  if (digiModes.includes(m) || digiModes.includes(sub)) {
    return "DIGI";
  }

  return "OTHER";
}

/**
 * Normalizes various date formats into YYYY-MM-DD
 */
export function normalizeDate(rawDate?: string): string {
  if (!rawDate) return "";
  const cleaned = rawDate.trim();

  // YYYYMMDD (standard ADIF)
  if (/^\d{8}$/.test(cleaned)) {
    const yyyy = cleaned.substring(0, 4);
    const mm = cleaned.substring(4, 6);
    const dd = cleaned.substring(6, 8);
    return `${yyyy}-${mm}-${dd}`;
  }

  // YYYY-MM-DD or YYYY/MM/DD
  const matchIso = cleaned.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (matchIso) {
    const [, yyyy, mm, dd] = matchIso;
    return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  }

  // DD-MM-YYYY or DD/MM/YYYY
  const matchEu = cleaned.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (matchEu) {
    const [, dd, mm, yyyy] = matchEu;
    return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  }

  return "";
}
