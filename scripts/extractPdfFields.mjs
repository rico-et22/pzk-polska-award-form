import { PDFDocument } from 'pdf-lib'
import fs from 'fs'

/**
 * PDF Field Extractor Tool
 * 
 * Usage: node scripts/extractPdfFields.mjs path/to/pdf
 * 
 * This script will load the specified PDF and print a cleanly formatted
 * list of every AcroForm field (TextFields and CheckBoxes) alongside 
 * their internal PDF name and physical coordinates (X/Y/Height).
 * 
 * Keep this script handy for future reference in case the union releases
 * an updated PDF template and we need to remap the form fields!
 */

async function extractFields() {
  const filePath = process.argv[2]
  
  if (!filePath) {
    console.error('Please provide a path to a PDF file.')
    console.error('Example: node scripts/extractPdfFields.mjs src/assets/forms/pl/Aplikacja_do_dyplomu_POLSKA_v3_int.pdf')
    process.exit(1)
  }

  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`)
    process.exit(1)
  }

  console.log(`\nAnalyzing PDF: ${filePath}...\n`)
  const bytes = fs.readFileSync(filePath)
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true })
  const form = doc.getForm()
  
  const fields = form.getFields()
  console.log(`Found ${fields.length} total fields.\n`)

  const textFields = []
  const checkBoxes = []

  for (const field of fields) {
    const type = field.constructor.name
    const name = field.getName()
    
    // Get widgets to find physical coordinates on the page
    const widgets = field.acroField.getWidgets()
    const rect = widgets.length > 0 ? widgets[0].getRectangle() : { x: 0, y: 0, height: 0, width: 0 }
    
    const data = {
      name,
      x: Math.round(rect.x),
      y: Math.round(rect.y),
      h: Math.round(rect.height),
      w: Math.round(rect.width)
    }

    if (type === 'PDFTextField') textFields.push(data)
    else if (type === 'PDFCheckBox') checkBoxes.push(data)
  }

  // Sort top-to-bottom, then left-to-right
  const spatialSort = (a, b) => {
    if (Math.abs(a.y - b.y) > 10) return b.y - a.y
    return a.x - b.x
  }

  textFields.sort(spatialSort)
  checkBoxes.sort(spatialSort)

  console.log('=== TEXT FIELDS (Top to Bottom) ===')
  textFields.forEach(f => {
    console.log(`Name: "${f.name}". Position: X=${f.x}, Y=${f.y}, Height=${f.h}, Width=${f.w}`)
  })

  console.log('\n=== CHECKBOXES (Top to Bottom) ===')
  checkBoxes.forEach(f => {
    console.log(`Name: "${f.name}". Position: X=${f.x}, Y=${f.y}, Height=${f.h}, Width=${f.w}`)
  })
  
  console.log('\nDone!')
}

extractFields().catch(err => {
  console.error('Error analyzing PDF:', err)
})
