import { useState } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import { parseTransactionsCsv, type ParsedCsvRow } from '../lib/csv'
import type { NewTransaction } from '../hooks/useTransactions'

const currency = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

export function ImportCsvModal({
  onClose,
  onImport,
}: {
  onClose: () => void
  onImport: (inputs: NewTransaction[]) => Promise<void>
}) {
  const [rows, setRows] = useState<ParsedCsvRow[]>([])
  const [fileName, setFileName] = useState<string | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)

  const validRows = rows.filter((r) => r.date && r.amount != null)
  const invalidCount = rows.length - validRows.length

  async function handleFile(file: File) {
    setFileName(file.name)
    setParseError(null)
    try {
      const parsed = await parseTransactionsCsv(file)
      setRows(parsed)
    } catch {
      setParseError('Could not read that file. Make sure it’s a CSV export from your bank.')
    }
  }

  async function handleConfirm() {
    setImporting(true)
    try {
      await onImport(
        validRows.map((r) => ({
          amount: r.amount as number,
          category: 'Uncategorized',
          merchant: r.description,
          description: r.description,
          transaction_date: r.date as string,
          is_recurring: false,
        })),
      )
      onClose()
    } finally {
      setImporting(false)
    }
  }

  return (
    <Modal title="Bulk import from CSV" onClose={onClose} widthClassName="max-w-2xl">
      <div className="flex flex-col gap-4">
        {rows.length === 0 && (
          <>
            <p className="text-sm text-ink-muted">
              Upload a bank statement CSV with date, description, and amount columns (common naming
              variations are handled automatically). We won't categorize these yet — that happens
              right after import.
            </p>
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-card border-2 border-dashed border-border bg-base px-6 py-10 text-center text-sm text-ink-muted transition hover:border-teal hover:text-teal-dark">
              <span>{fileName ?? 'Click to choose a CSV file'}</span>
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFile(file)
                }}
              />
            </label>
            {parseError && <p className="rounded-lg bg-danger-tint px-3 py-2 text-sm text-danger">{parseError}</p>}
          </>
        )}

        {rows.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-ink-muted">
                {validRows.length} row{validRows.length === 1 ? '' : 's'} ready to import
                {invalidCount > 0 ? `, ${invalidCount} skipped (couldn't read date/amount)` : ''}.
              </p>
              <button
                type="button"
                onClick={() => {
                  setRows([])
                  setFileName(null)
                }}
                className="text-sm font-medium text-teal hover:text-teal-dark"
              >
                Choose a different file
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto rounded-card border border-border">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-base text-left text-ink-muted">
                  <tr>
                    <th className="px-3 py-2 font-medium">Date</th>
                    <th className="px-3 py-2 font-medium">Description</th>
                    <th className="px-3 py-2 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((r, i) => {
                    const invalid = !r.date || r.amount == null
                    return (
                      <tr key={i} className={invalid ? 'opacity-40' : ''}>
                        <td className="px-3 py-2 text-ink">{r.date ?? '—'}</td>
                        <td className="px-3 py-2 text-ink">{r.description ?? '—'}</td>
                        <td className="px-3 py-2 text-right font-mono text-ink">
                          {r.amount != null ? currency(r.amount) : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex gap-3">
              <Button type="button" onClick={handleConfirm} disabled={validRows.length === 0 || importing}>
                {importing ? 'Importing…' : `Import ${validRows.length} transaction${validRows.length === 1 ? '' : 's'}`}
              </Button>
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
