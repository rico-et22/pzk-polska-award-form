import { PDFDocument, rgb } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Script to update the guide section (points 4 & 5) in the Polish source PDF template
 * (src/assets/forms/pl/Aplikacja_do_dyplomu_POLSKA_v3_int.pdf).
 *
 * Updates:
 * - Point 4: Removes hardcoded "(2,60 PLN)" postal fee.
 * - Point 5: Updates PZK HQ address from Bydgoszcz to Warsaw:
 *   "ul. Augustyna Kordeckiego 66 lok. U1, 04-355 Warszawa".
 *
 * Preserves all 93 AcroForm fields, widget coordinates, and types.
 */
async function updatePolishPdf() {
  const targetPdfPath = path.resolve(
    __dirname,
    '../src/assets/forms/pl/Aplikacja_do_dyplomu_POLSKA_v3_int.pdf'
  )

  if (!fs.existsSync(targetPdfPath)) {
    console.error(`Target PDF not found at ${targetPdfPath}`)
    process.exit(1)
  }

  console.log(`Loading source PDF: ${targetPdfPath}`)
  const bytes = fs.readFileSync(targetPdfPath)
  const doc = await PDFDocument.load(bytes)
  doc.registerFontkit(fontkit)

  // Find system fonts or fallback
  const possibleItalicPaths = [
    '/System/Library/Fonts/Supplemental/Arial Italic.ttf',
    '/Library/Fonts/Arial Italic.ttf',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans-Oblique.ttf',
    '/usr/share/fonts/truetype/liberation/LiberationSans-Italic.ttf',
  ]
  const possibleBoldItalicPaths = [
    '/System/Library/Fonts/Supplemental/Arial Bold Italic.ttf',
    '/Library/Fonts/Arial Bold Italic.ttf',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans-BoldOblique.ttf',
    '/usr/share/fonts/truetype/liberation/LiberationSans-BoldItalic.ttf',
  ]

  let italicBytes = null
  let boldItalicBytes = null

  for (const p of possibleItalicPaths) {
    if (fs.existsSync(p)) {
      italicBytes = fs.readFileSync(p)
      break
    }
  }

  for (const p of possibleBoldItalicPaths) {
    if (fs.existsSync(p)) {
      boldItalicBytes = fs.readFileSync(p)
      break
    }
  }

  if (!italicBytes || !boldItalicBytes) {
    console.log('Local system fonts not found, fetching web fonts...')
    const respItalic = await fetch(
      'https://raw.githubusercontent.com/google/fonts/main/ofl/ubuntu/Ubuntu-Italic.ttf'
    )
    italicBytes = Buffer.from(await respItalic.arrayBuffer())

    const respBoldItalic = await fetch(
      'https://raw.githubusercontent.com/google/fonts/main/ofl/ubuntu/Ubuntu-BoldItalic.ttf'
    )
    boldItalicBytes = Buffer.from(await respBoldItalic.arrayBuffer())
  }

  const fontItalic = await doc.embedFont(italicBytes)
  const fontBoldItalic = await doc.embedFont(boldItalicBytes)

  const page = doc.getPage(0)

  // Mask obsolete points 4 and 5 with a white rectangle
  page.drawRectangle({
    x: 45,
    y: 221,
    width: 265,
    height: 68,
    color: rgb(1, 1, 1),
  })

  const fontSize = 7.4
  const numIndent = 57.2
  const textIndent = 71.0

  // --- Point 4 ---
  let y = 280.5
  page.drawText('4)', {
    x: numIndent,
    y,
    size: fontSize,
    font: fontItalic,
    color: rgb(0, 0, 0),
  })
  page.drawText(
    'Nalepki za dyplom są darmowe, jeśli są wysyłane razem z dyplomem.',
    { x: textIndent, y, size: fontSize, font: fontItalic, color: rgb(0, 0, 0) }
  )
  y -= 8.8
  page.drawText(
    'Jeśli nalepki są wysyłane oddzielnie, wraz ze zgłoszeniem należy',
    { x: textIndent, y, size: fontSize, font: fontItalic, color: rgb(0, 0, 0) }
  )
  y -= 8.8
  page.drawText(
    'przesłać znaczek pocztowy na list zwykły na pokrycie kosztów',
    { x: textIndent, y, size: fontSize, font: fontItalic, color: rgb(0, 0, 0) }
  )
  y -= 8.8
  page.drawText('wysyłki nalepek.', {
    x: textIndent,
    y,
    size: fontSize,
    font: fontItalic,
    color: rgb(0, 0, 0),
  })

  // --- Point 5 ---
  y = 247.0
  page.drawText('5)', {
    x: numIndent,
    y,
    size: fontSize,
    font: fontItalic,
    color: rgb(0, 0, 0),
  })
  page.drawText(
    'Opłat za dyplomy należy dokonywać na konto ZG PZK, ul. Augustyna',
    { x: textIndent, y, size: fontSize, font: fontItalic, color: rgb(0, 0, 0) }
  )
  y -= 8.5
  page.drawText('Kordeckiego 66 lok. U1, 04-355 Warszawa -', {
    x: textIndent,
    y,
    size: fontSize,
    font: fontItalic,
    color: rgb(0, 0, 0),
  })
  y -= 8.5
  const nrText = 'nr '
  page.drawText(nrText, {
    x: textIndent,
    y,
    size: fontSize,
    font: fontItalic,
    color: rgb(0, 0, 0),
  })
  const nrWidth = fontItalic.widthOfTextAtSize(nrText, fontSize)
  page.drawText('61 1140 1010 0000 3533 4800 1001.', {
    x: textIndent + nrWidth,
    y,
    size: fontSize,
    font: fontBoldItalic,
    color: rgb(0, 0, 0),
  })
  y -= 8.5
  page.drawText(
    'Kserokopię dowodu wpłaty należy dołączyć do zgłoszenia.',
    { x: textIndent, y, size: fontSize, font: fontItalic, color: rgb(0, 0, 0) }
  )

  const updatedBytes = await doc.save()
  fs.writeFileSync(targetPdfPath, updatedBytes)
  console.log(`Successfully updated ${targetPdfPath}`)
}

updatePolishPdf().catch((err) => {
  console.error('Error updating Polish PDF:', err)
  process.exit(1)
})
