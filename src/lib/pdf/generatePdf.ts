import { PDFDocument, PDFTextField, PDFCheckBox, PDFForm } from "pdf-lib";
import type fontkit from "@pdf-lib/fontkit";
import type { ApplicationFormData } from "@/schemas/applicationSchema";
import { PL_CHECKBOX_MAP, EN_CHECKBOX_MAP } from "./checkboxMaps";

const ROWS_PER_PAGE = 30;

/**
 * Generate a filled PDF from the form data.
 * Loads the locale-appropriate application template and record sheet template,
 * fills them, flattens, and merges into a single downloadable PDF.
 */
export async function generatePdf(
  data: ApplicationFormData,
  locale: "pl" | "en",
): Promise<Uint8Array> {
  // Dynamic imports for code splitting — these are large assets
  const fontkitModule = await import("@pdf-lib/fontkit");
  const fk = fontkitModule.default as typeof fontkit;

  // Load PDF templates
  const [applicationBytes, recordSheetBytes, fontBytes] = await Promise.all([
    loadTemplate(locale, "application"),
    loadTemplate(locale, "recordSheet"),
    loadFont(),
  ]);

  // --- Fill the application form ---
  const appDoc = await PDFDocument.load(applicationBytes);
  appDoc.registerFontkit(fk);
  const customFont = await appDoc.embedFont(fontBytes);
  const appForm = appDoc.getForm();

  fillApplicationFields(appForm, data, locale);

  // Flatten to burn values in, using custom font for Polish characters
  appForm.updateFieldAppearances(customFont);
  try {
    appForm.flatten();
  } catch (err) {
    console.warn("Could not flatten application form", err);
  }

  // --- Fill record sheets (one per 30 rows) ---
  const filledRecordPages: Uint8Array[] = [];
  const totalPages = Math.ceil(data.contacts.length / ROWS_PER_PAGE);

  for (let page = 0; page < totalPages; page++) {
    const pageContacts = data.contacts.slice(
      page * ROWS_PER_PAGE,
      (page + 1) * ROWS_PER_PAGE,
    );
    const recordDoc = await PDFDocument.load(recordSheetBytes);
    recordDoc.registerFontkit(fk);
    const recordFont = await recordDoc.embedFont(fontBytes);
    const recordForm = recordDoc.getForm();

    fillRecordSheetFields(
      recordForm,
      pageContacts,
      page * ROWS_PER_PAGE + 1,
      page + 1,
      totalPages,
      data,
    );
    recordForm.updateFieldAppearances(recordFont);
    try {
      recordForm.flatten();
    } catch (err) {
      console.warn("Could not flatten record sheet", err);
    }

    const recBytes = await recordDoc.save();
    filledRecordPages.push(recBytes);
  }

  // --- Merge all pages into a single PDF ---
  const mergedDoc = await PDFDocument.create();

  // Copy application pages
  const appPages = await mergedDoc.copyPages(appDoc, appDoc.getPageIndices());
  for (const p of appPages) {
    mergedDoc.addPage(p);
  }

  // Copy record sheet pages
  for (const recordBytes of filledRecordPages) {
    const recordDoc = await PDFDocument.load(recordBytes);
    const pages = await mergedDoc.copyPages(
      recordDoc,
      recordDoc.getPageIndices(),
    );
    for (const p of pages) {
      mergedDoc.addPage(p);
    }
  }

  return mergedDoc.save();
}

// --- Private helpers ---

async function loadTemplate(
  locale: "pl" | "en",
  type: "application" | "recordSheet",
): Promise<ArrayBuffer> {
  const urls: Record<string, Record<string, string>> = {
    pl: {
      application: new URL(
        "@/assets/forms/pl/Aplikacja_do_dyplomu_POLSKA_v3_int.pdf",
        import.meta.url,
      ).href,
      recordSheet: new URL(
        "@/assets/forms/shared/Record_sheet_POLSKA_int.pdf",
        import.meta.url,
      ).href,
    },
    en: {
      application: new URL(
        "@/assets/forms/en/Application_for_POLSKA_Award_int.pdf",
        import.meta.url,
      ).href,
      recordSheet: new URL(
        "@/assets/forms/shared/Record_sheet_POLSKA_int.pdf",
        import.meta.url,
      ).href,
    },
  };
  const resp = await fetch(urls[locale][type]);
  return resp.arrayBuffer();
}

async function loadFont(): Promise<ArrayBuffer> {
  // Use a TTF font instead of WOFF2 to prevent the "dots" issue in Safari/Apple Preview
  const resp = await fetch("https://pdf-lib.js.org/assets/ubuntu/Ubuntu-R.ttf");
  return resp.arrayBuffer();
}

// Sort text fields spatially (top-to-bottom, left-to-right)
function getSortedTextFields(form: PDFForm): PDFTextField[] {
  const fields = form
    .getFields()
    .filter((f): f is PDFTextField => f instanceof PDFTextField);

  const data = fields.map((f) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const widgets = (f as any).acroField.getWidgets();
    const rect = widgets[0]?.getRectangle() || {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    };
    return {
      field: f as PDFTextField,
      x: Math.round(rect.x),
      y: Math.round(rect.y),
    };
  });

  // Sort by Y descending, then X ascending
  data.sort((a, b) => {
    if (Math.abs(a.y - b.y) > 10) return b.y - a.y;
    return a.x - b.x;
  });

  return data.map((d) => d.field);
}

function getSortedCheckBoxes(form: PDFForm): PDFCheckBox[] {
  const fields = form
    .getFields()
    .filter((f): f is PDFCheckBox => f instanceof PDFCheckBox);
  return fields.sort((a, b) => {
    const wA = a.acroField.getWidgets()[0];
    const wB = b.acroField.getWidgets()[0];
    const rectA = wA.getRectangle();
    const rectB = wB.getRectangle();
    if (Math.abs(rectB.y - rectA.y) > 5) {
      return rectB.y - rectA.y; // Descending Y
    }
    return rectA.x - rectB.x; // Ascending X
  });
}

function fillApplicationFields(
  form: PDFForm,
  data: ApplicationFormData,
  locale: "pl" | "en",
) {
  const tf = getSortedTextFields(form);
  const cb = getSortedCheckBoxes(form);

  const setSafe = (idx: number, val: string) => {
    if (idx < tf.length && val) {
      tf[idx].setText(val);
    }
  };

  if (locale === "pl") {
    setSafe(0, data.callsign);
    setSafe(1, data.exCalls);
    setSafe(2, data.firstName);
    setSafe(3, data.lastName);
    setSafe(4, data.address1);
    setSafe(5, data.address2);

    // Postcode (zip+city) split logic
    const zipMatch = data.postcode.match(/^(\d)(\d)[^\d]*(\d)(\d)(\d)$/);
    if (zipMatch) {
      setSafe(6, zipMatch[1]);
      setSafe(7, zipMatch[2]);
      setSafe(8, zipMatch[3]);
      setSafe(9, zipMatch[4]);
      setSafe(10, zipMatch[5]);
    }
    setSafe(11, data.city);

    setSafe(12, data.telephone);
    setSafe(13, data.email);
    setSafe(14, data.issueTo1);
    setSafe(15, data.issueTo2);

    // PL New vs Renewal Checkboxes
    try {
      if (data.applyFor === "new") form.getCheckBox("CheckBox1").check();
      if (data.applyFor === "sticker") form.getCheckBox("CheckBox2").check();
      if (data.previousEdition) form.getCheckBox("czy_juz_mam").check();
    } catch (err) {}

    // PZK Member
    const bottomCbs = cb.slice(-3);
    if (data.pzkMember === "yes" && bottomCbs[2]) {
      bottomCbs[2].check();
    } else if (data.pzkMember === "no" && bottomCbs[1]) {
      bottomCbs[1].check();
    }
    setSafe(16, data.feeAmount || "");

    // GCR Fields
    try {
      if (data.gcr1Name) form.getTextField("nazw1").setText(data.gcr1Name);
      if (data.gcr1Callsign)
        form.getTextField("zn1").setText(data.gcr1Callsign);
      if (data.gcr2Name) form.getTextField("nazw2").setText(data.gcr2Name);
      if (data.gcr2Callsign)
        form.getTextField("zn2").setText(data.gcr2Callsign);

      // Ensure compact font size for GCR fields to fit
      form.getTextField("nazw1").setFontSize(9);
      form.getTextField("zn1").setFontSize(9);
      form.getTextField("nazw2").setFontSize(9);
      form.getTextField("zn2").setFontSize(9);
    } catch (e) {}

    // Address fonts
    try {
      form.getTextField("adr-ul").setFontSize(10);
      form.getTextField("adr-dodatkowe miejsce").setFontSize(10);
      form.getTextField("poczta").setFontSize(10);
      form.getTextField("kod1").setFontSize(10);
      form.getTextField("kod2").setFontSize(10);
      form.getTextField("kod3").setFontSize(10);
      form.getTextField("kod4").setFontSize(10);
      form.getTextField("kod5").setFontSize(10);

      // Also increase other personal fields
      form.getTextField("imie").setFontSize(10);
      form.getTextField("nazwisko").setFontSize(10);
      form.getTextField("tel").setFontSize(10);
      form.getTextField("mail").setFontSize(10);
      form.getTextField("dla_kogo1").setFontSize(10);
      form.getTextField("dla_kogo2").setFontSize(10);
      form.getTextField("PLN").setFontSize(10);
    } catch (e) {
      console.warn("Failed to set some PL form font sizes:", e);
    }

    // Date
    try {
      const today = new Date();
      const months = [
        "STY",
        "LUT",
        "MAR",
        "KWI",
        "MAJ",
        "CZE",
        "LIP",
        "SIE",
        "WRZ",
        "PAŹ",
        "LIS",
        "GRU",
      ];
      const formattedDate = `${String(today.getDate()).padStart(2, "0")}-${months[today.getMonth()]}-${today.getFullYear()}`;

      form.getTextField("data").setText(formattedDate);
      form.getTextField("podpis").setText("");
      form.getTextField("call_podpisu").setText("");
    } catch (e) {}

    // GCR on Application Form
    try {
      form.getTextField("Nad1").setText(data.gcr1Name);
      form.getTextField("nad1_call").setText(data.gcr1Callsign);
      form.getTextField("Nad2").setText(data.gcr2Name);
      form.getTextField("nad2_call").setText(data.gcr2Callsign);

      form.getTextField("Nad1").setFontSize(9);
      form.getTextField("nad1_call").setFontSize(9);
      form.getTextField("Nad2").setFontSize(9);
      form.getTextField("nad2_call").setFontSize(9);
    } catch (e) {}
  } else {
    // English form mapping
    try {
      form.getTextField("call").setText(data.callsign); // "Call Sign:"
      form.getTextField("prev_call").setText(data.exCalls); // "Ex calls:"
      form.getTextField("first_name").setText(data.firstName); // "Name (First)"
      form.getTextField("last_name").setText(data.lastName); // "Name (Last)"
      form.getTextField("addr1").setText(data.address1); // "Mailing address 1"
      form.getTextField("addr2").setText(data.address2); // "Mailing address 2"
      form
        .getTextField("addr3")
        .setText(`${data.city} ${data.postcode}`.trim()); // "City, State/Zip"
      form.getTextField("tel").setText(data.telephone); // "Telephone #:"
      form.getTextField("email").setText(data.email); // "E-mail:"
      form.getTextField("komu1").setText(data.issueTo1); // "Please issue the award to:"
      form.getTextField("Text7").setText(data.issueTo2); // [Huge box below issue to]

      if (data.spDxContestYear) {
        form.getCheckBox("undefined.spdxc").check();
        form.getTextField("undefined.year-SPDX").setText(data.spDxContestYear);
      } else {
        form.getTextField("undefined.year-SPDX").setText("");
      }
      if (data.spDxRttyContestYear) {
        form.getCheckBox("undefined.sprttydxc").check();
        form
          .getTextField("undefined.year-RTTY")
          .setText(data.spDxRttyContestYear);
      } else {
        form.getTextField("undefined.year-RTTY").setText("");
      }
    } catch (e) {}

    // EN New vs Renewal Checkboxes
    try {
      if (data.applyFor === "new") form.getCheckBox("CheckBox1").check();
      if (data.applyFor === "sticker") form.getCheckBox("CheckBox2").check();
      if (data.previousEdition) form.getCheckBox("prev_ed").check();
    } catch (err) {}

    // PZK Member
    const bottomCbs = cb.slice(-4);
    if (data.pzkMember === "yes" && bottomCbs[1]) bottomCbs[1].check();

    // Payment Fields
    try {
      form.getTextField("undefined.€").setText(data.feeAmountEur || "");
      form.getTextField("undefined.$").setText(data.feeAmountUsd || "");
      form.getTextField("undefined.IRC").setText(data.feeAmountIrc || "");
      form.getTextField("pay").setText(data.feeAmountOther || "");

      // GCR Fields
      form.getTextField("undefined.1check").setText(data.gcr1Name || "");
      form
        .getTextField("undefined.call_chck_1")
        .setText(data.gcr1Callsign || "");
      form.getTextField("undefined.2check").setText(data.gcr2Name || "");
      form
        .getTextField("undefined.call_chck_2")
        .setText(data.gcr2Callsign || "");

      form.getTextField("undefined.1check").setFontSize(9);
      form.getTextField("undefined.call_chck_1").setFontSize(9);
      form.getTextField("undefined.2check").setFontSize(9);
      form.getTextField("undefined.call_chck_2").setFontSize(9);
    } catch (e) {}

    // Date
    try {
      const today = new Date();
      const months = [
        "JAN",
        "FEB",
        "MAR",
        "APR",
        "MAY",
        "JUN",
        "JUL",
        "AUG",
        "SEP",
        "OCT",
        "NOV",
        "DEC",
      ];
      const formattedDate = `${String(today.getDate()).padStart(2, "0")}-${months[today.getMonth()]}-${today.getFullYear()}`;

      form.getTextField("date").setText(formattedDate);
      form.getTextField("sign").setText("");
    } catch (e) {}
  }

  // Matrix checkboxes
  const map = locale === "pl" ? PL_CHECKBOX_MAP : EN_CHECKBOX_MAP;
  data.selections.forEach((sel) => {
    // sel is like "mixed:new", which is exactly the key in the map
    const fieldName = map[sel];
    if (fieldName) {
      try {
        form.getCheckBox(fieldName).check();
      } catch (err) {}
    }
  });
}

function fillRecordSheetFields(
  form: PDFForm,
  qsos: ApplicationFormData["contacts"],
  startNum: number,
  pageIndex: number,
  totalPages: number,
  data: ApplicationFormData,
) {
  const tf = getSortedTextFields(form);

  const setSafe = (index: number, val: string, fontSize?: number) => {
    const field = tf[index];
    if (field) {
      try {
        field.setText(val);
        if (fontSize) {
          field.setFontSize(fontSize);
        }
      } catch (e) {}
    }
  };

  // Set default font size larger for address fields if not explicitly specified
  tf.forEach((f) => {
    try {
      f.setFontSize(11); // Increase default text size slightly
    } catch (err) {}
  });

  // Map common fields
  setSafe(0, data.callsign);
  setSafe(1, String(pageIndex)); // str (current page)
  setSafe(2, String(totalPages)); // total (total pages)

  // GCR Fields and Header fields for Record Sheet
  try {
    form.getTextField("nazw1").setText(data.gcr1Name);
    form.getTextField("zn1").setText(data.gcr1Callsign);
    form.getTextField("nazw2").setText(data.gcr2Name);
    form.getTextField("zn2").setText(data.gcr2Callsign);
    form.getTextField("podp").setText("");
    form.getTextField("znak").setText(data.callsign); // Callsign in header
  } catch (e) {}

  // Rows start at index 3, with 9 fields per row
  qsos.forEach((qso, i) => {
    const base = 3 + i * 9;
    setSafe(base + 0, String(startNum + i), 10);
    setSafe(base + 1, qso.callsign, 10);

    // qso.date is stored as YYYY-MM-DD
    if (qso.date.includes("-")) {
      const [yyyy, mm, dd] = qso.date.split("-");
      setSafe(base + 2, dd, 10);
      setSafe(base + 3, mm, 10);
      setSafe(base + 4, yyyy, 10);
    } else {
      setSafe(base + 2, qso.date, 10);
    }

    setSafe(base + 5, qso.band, 10);
    setSafe(base + 6, qso.mode, 10);

    setSafe(base + 7, qso.voivodeship || "", 9);
    setSafe(base + 8, qso.remarks || "", 10);
  });
}

export function downloadBlob(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
