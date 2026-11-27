import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Period } from '../api/types'
import { periodLabel, shiftMonth } from '../lib/period'
import { inputClass } from './ui'

export function PeriodPicker({ value, onChange }: { value: Period; onChange: (period: Period) => void }) {
  const navButton =
    'rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100'

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <button type="button" className={navButton} onClick={() => onChange(shiftMonth(value, -1))} aria-label="Mois précédent">
          <ChevronLeft className="size-4" />
        </button>
        <span className="min-w-36 px-2 text-center text-sm font-semibold">{periodLabel(value)}</span>
        <button type="button" className={navButton} onClick={() => onChange(shiftMonth(value, 1))} aria-label="Mois suivant">
          <ChevronRight className="size-4" />
        </button>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="date"
          aria-label="Date de début"
          className={`${inputClass} w-auto`}
          value={value.from}
          max={value.to}
          onChange={(event) => event.target.value && onChange({ ...value, from: event.target.value })}
        />
        <span className="text-slate-400">→</span>
        <input
          type="date"
          aria-label="Date de fin"
          className={`${inputClass} w-auto`}
          value={value.to}
          min={value.from}
          onChange={(event) => event.target.value && onChange({ ...value, to: event.target.value })}
        />
      </div>
    </div>
  )
}
