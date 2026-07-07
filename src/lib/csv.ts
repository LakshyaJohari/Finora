import Papa from 'papaparse'

export interface ParsedCsvRow {
  date: string | null
  description: string | null
  amount: number | null
}

const DATE_KEYS = ['date', 'transactiondate', 'txndate', 'postingdate', 'valuedate']
const DESCRIPTION_KEYS = ['description', 'desc', 'narration', 'memo', 'details', 'particulars', 'merchant']
const AMOUNT_KEYS = ['amount', 'amt', 'value', 'transactionamount']
const DEBIT_KEYS = ['debit', 'withdrawal', 'withdrawalamt', 'debitamount']
const CREDIT_KEYS = ['credit', 'deposit', 'creditamt', 'creditamount']

function normalizeHeader(header: string) {
  return header.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
}

function findColumn(headers: string[], candidates: string[]) {
  return headers.find((h) => candidates.includes(normalizeHeader(h)))
}

function parseAmount(value: unknown): number | null {
  if (value == null || value === '') return null
  const cleaned = String(value).replace(/[,₹$\s]/g, '').replace(/^\((.*)\)$/, '-$1')
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : null
}

function parseDate(value: unknown): string | null {
  if (!value) return null
  const raw = String(value).trim()

  // Already ISO (yyyy-mm-dd, optionally with a time suffix) - read directly,
  // never round-trip through a local-time Date, which can shift the day.
  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (isoMatch) {
    const [, y, m, d] = isoMatch
    return `${y}-${m}-${d}`
  }

  const parts = raw.split(/[/.-]/).map((p) => p.trim())
  if (parts.length === 3) {
    const nums = parts.map(Number)
    if (nums.every((n) => Number.isFinite(n))) {
      let [a, b, year] = nums
      if (a > 31 || String(a).length === 4) {
        year = a
        a = nums[2]
      }
      // Ambiguous two-digit day/month order (e.g. 07/01/2026): default to
      // day-first (DD/MM/YYYY), matching the app's INR/India-first context.
      const day = a > 12 ? a : b > 12 ? b : a
      const month = a > 12 ? b : b > 12 ? a : b
      const y = year < 100 ? 2000 + year : year
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        return `${y}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      }
    }
  }
  return null
}

export function parseTransactionsCsv(file: File): Promise<ParsedCsvRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields ?? []
        const dateCol = findColumn(headers, DATE_KEYS)
        const descCol = findColumn(headers, DESCRIPTION_KEYS)
        const amountCol = findColumn(headers, AMOUNT_KEYS)
        const debitCol = findColumn(headers, DEBIT_KEYS)
        const creditCol = findColumn(headers, CREDIT_KEYS)

        const rows: ParsedCsvRow[] = results.data.map((row) => {
          let amount: number | null = null
          if (amountCol) {
            amount = parseAmount(row[amountCol])
          } else if (debitCol || creditCol) {
            const debitRaw = debitCol ? parseAmount(row[debitCol]) : null
            const creditRaw = creditCol ? parseAmount(row[creditCol]) : null
            amount = debitRaw == null && creditRaw == null ? null : (creditRaw ?? 0) - (debitRaw ?? 0)
          }
          return {
            date: dateCol ? parseDate(row[dateCol]) : null,
            description: descCol ? String(row[descCol] ?? '').trim() || null : null,
            amount,
          }
        })
        resolve(rows)
      },
      error: (err) => reject(err),
    })
  })
}
