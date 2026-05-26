# PZK POLSKA Award PDF Generator

A modern, responsive React web application that completely automates the tedious process of filling out the official **"POLSKA" Award** PDF forms issued by the [PZK (Polski Związek Krótkofalowców)](http://awards.pzk.org.pl/).

Instead of manually fighting with interactive PDF forms or filling them by hand and stitching together, ham radio operators can use this web UI to punch in their QSO contacts, select their award categories, and automatically generate a flattened, print-ready PDF containing both their Application and required Record Sheets.

## Features

- **Bilingual Interface**: Fully supports both Polish and English.
- **Smart Validation**: Uses Zod to ensure callsigns, dates, and required fields are present.
- **Auto-Pagination**: Automatically splits your log of QSO contacts into perfectly paginated, 30-row Record Sheets.
- **Dark Mode**: Sleek, modern interface using Tailwind CSS and shadcn/ui.
- **Instant Generation**: Fills out the PDF locally in your browser using `pdf-lib` (no server backend required), automatically giving full data protection compliance.

## PDF Quirks & Engineering

The original PDF forms (sourced from the official [PZK Awards website](http://awards.pzk.org.pl/)) had several technical quirks that required custom engineering to overcome:

1. **Chaotic Internal Field Names**:
   The internal AcroForm fields inside the PDFs were not cleanly named (e.g. `Text7`, `CheckBox15`, `undefined.gld_mix`). To combat this without modifying the original PDFs, this application uses a **spatial extraction technique**. It grabs all fields and mathematically sorts them based on their physical X/Y coordinates (top-to-bottom, left-to-right) so it can accurately inject data into the correct visual boxes regardless of their internal names. If the PDFs are ever updated, you can use the `node scripts/extractPdfFields.mjs` utility to map the new coordinates.

2. **The "Safari Dots" Bug**:
   Safari and Apple Preview have a notorious bug where injecting standard web fonts (like `.woff2`) into `pdf-lib` silently crashes the font renderer, leaving the entire document covered in literal dots (••••). This app works around that by fetching and embedding a native `Ubuntu-R.ttf` TrueType font specifically for the PDF generation pipeline, ensuring perfect cross-platform rendering across Chrome, Firefox, Safari, and macOS Preview.

## Advanced Usage & Debugging

- **Auto-Fill Form Data**: If you are actively developing and want to bypass manually typing out the form repeatedly, simply open your browser's developer console and run `localStorage.setItem('debug', 'true')`. This enables a hidden "Fill Debug Data" button above the form that instantly populates all required fields and categories.
- **PDF Field Discovery**: The codebase includes a `scripts/extractPdfFields.mjs` script. If PZK updates their official PDF forms in the future and the field names change, simply run `node scripts/extractPdfFields.mjs path/to/new_form.pdf` to instantly extract a list of all exact X/Y spatial coordinates and AcroForm internal names.

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

## Credits

This application was rapidly engineered and built with the help of **Google Antigravity agents** (Claude Opus 4.6 and Gemini 3.1 Pro).

Forms and award rules are the property of the [Polski Związek Krótkofalowców (PZK)](http://awards.pzk.org.pl/).
