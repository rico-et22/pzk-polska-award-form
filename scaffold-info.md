# "PZK Polska Award" Form

## Background

"Polska Award" is one of the most popular ham radio awards granted by Polish Amateur Radio Union / PZK.

Right now the award form requires manual filling - while possible to be computer aided, we want to switch to a more user-friendly way.
This app will display an interactive form with all the form fields from the award forms, with proper validation, and then automatically generate an application PDF with all values filled, ready to sign.

## App Layout and logic

### Forms

Get the forms from `src/assets/forms`. They are both reference for the form fields in the app, and the blank forms used as source to fill them with data (they should have interactive elements).

Form consists of two parts: application form (only one page) and record sheet (as many pages as needed to prove QSOs).

Note: Application form part has different fields between PL and EN locales.

### App Layout

Should be responsive, the container should be ~1000px max-width.

- Header (PZK logo / "Wniosek o nagrodę Polska Award") + lang switcher
- Explanations ('Objaśnienia' section in form - note for different locales)
- Application data form (varies for locales)
  - Note regarding the category markings: you can select one of combinations (category x award class <new/upgrade to 1/2/3>)
- Record sheet as table with option to add, edit, and remove rows (as with record sheet)
- Confirmation checkbox as in the form
- Provide a "download" or "export" button that generates a PDF with all the filled data. (Application form + as many record sheets as needed, stitched to one PDF)

## Design & architecture info

- `react-hook-form` + `zod` validation
- Use `shadcn-ui` with default setup for form components, but adjust the design as below:
- Main color: `#0055b8`
- Support both dark & light mode
- Use `system-ui` font
- In header, use PZK logo (`Logo_PZK.svg`)
- PL (default) & EN languages. Use i18next. Ensure html lang param switch.
- Ensure basic a11y compliance

## Note

Research if filling out the PDF completely frontend-side is possible for provided forms. If not, stop the implementation - we may need to switch to Nextjs.
