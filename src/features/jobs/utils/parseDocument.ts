import * as pdfjsLib from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url'
import mammoth from 'mammoth'

// Configure PDF.js worker using Vite's explicit ?url loader with CDN fallback
pdfjsLib.GlobalWorkerOptions.workerSrc =
  pdfWorker || `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

/**
 * Extracts raw text from a PDF file using pdfjs-dist.
 */
async function parsePdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const pageTexts: string[] = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()

    let lastY: number | null = null
    const lines: string[] = []
    let currentLine = ''

    for (const rawItem of content.items) {
      if (!('str' in rawItem)) continue
      const item = rawItem as { str: string; transform: number[]; hasEOL?: boolean }
      const y = item.transform?.[5]

      // A vertical position shift indicates a new line
      if (lastY !== null && y !== undefined && Math.abs(y - lastY) > 3) {
        if (currentLine.trim()) {
          lines.push(currentLine.trim())
          currentLine = ''
        }
      }

      currentLine += (currentLine && !currentLine.endsWith(' ') ? ' ' : '') + item.str
      if (item.hasEOL) {
        if (currentLine.trim()) {
          lines.push(currentLine.trim())
          currentLine = ''
        }
      }
      if (y !== undefined) {
        lastY = y
      }
    }
    if (currentLine.trim()) {
      lines.push(currentLine.trim())
    }
    pageTexts.push(lines.join('\n'))
  }

  return pageTexts.join('\n\n')
}

/**
 * Extracts raw text from a DOCX file using mammoth.
 */
async function parseDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer })
  return result.value
}

/**
 * Reads a plain text file using the FileReader API.
 */
function parseTxt(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read text file.'))
    reader.readAsText(file)
  })
}

/**
 * Routes to the correct parser based on file extension.
 * Returns the extracted text content from the document.
 */
export async function parseDocument(file: File): Promise<string> {
  const name = file.name.toLowerCase()

  if (name.endsWith('.pdf')) {
    return parsePdf(file)
  }

  if (name.endsWith('.docx') || name.endsWith('.doc')) {
    return parseDocx(file)
  }

  if (name.endsWith('.txt')) {
    return parseTxt(file)
  }

  throw new Error(`Unsupported file type: ${name.split('.').pop()}`)
}
