import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useFormContext, useFieldArray } from 'react-hook-form'
import {
  Plus,
  Pencil,
  Trash2,
  TableProperties,
  Upload,
  ArrowDownUp,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  BANDS,
  MODES,
  VOIVODESHIPS,
  isPolishCallsign,
  type QsoRow,
  type ApplicationFormData,
} from '@/schemas/applicationSchema'
import { ImportQsoDialog } from './ImportQsoDialog'
import { sortQsoContacts } from '@/lib/importers/qsoSorter'

const emptyRow: QsoRow = {
  callsign: '',
  date: '',
  band: '20m',
  mode: 'SSB',
  voivodeship: '',
  remarks: '',
}

const ROWS_PER_PAGE = 30

export function RecordSheet() {
  const { t } = useTranslation()
  const form = useFormContext<ApplicationFormData>()
  const { fields, append, remove, update, replace } = useFieldArray({
    control: form.control,
    name: 'contacts',
  })

  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [editData, setEditData] = useState<QsoRow>(emptyRow)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [clearDialogOpen, setClearDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const openAddDialog = () => {
    setEditIndex(null)
    setEditData({ ...emptyRow })
    setDialogOpen(true)
  }

  const openEditDialog = (actualIndex: number) => {
    setEditIndex(actualIndex)
    setEditData({ ...fields[actualIndex] })
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (editIndex !== null) {
      update(editIndex, editData)
    } else {
      append(editData)
      // Navigate to the last page when a new row is appended
      const newTotalPages = Math.ceil((fields.length + 1) / ROWS_PER_PAGE)
      setCurrentPage(newTotalPages)
    }
    setDialogOpen(false)
  }

  const handleDelete = (actualIndex: number) => {
    remove(actualIndex)
    // Adjust current page if needed
    const remainingCount = fields.length - 1
    const newTotalPages = Math.max(1, Math.ceil(remainingCount / ROWS_PER_PAGE))
    if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages)
    }
  }

  const handleSort = () => {
    const currentContacts = form.getValues('contacts') || (fields as QsoRow[])
    const sorted = sortQsoContacts(currentContacts)
    replace(sorted)
    form.setValue('contacts', sorted, { shouldDirty: true })
  }

  const handleClearAll = () => {
    replace([])
    setClearDialogOpen(false)
    setCurrentPage(1)
  }

  const updateField = (field: keyof QsoRow, value: string) => {
    setEditData((prev) => ({ ...prev, [field]: value }))
  }

  const totalPages = Math.max(1, Math.ceil(fields.length / ROWS_PER_PAGE))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const startIndex = (safeCurrentPage - 1) * ROWS_PER_PAGE
  const paginatedFields = fields.slice(startIndex, startIndex + ROWS_PER_PAGE)

  // Calculate unique voivodeships count
  const uniqueVoivodeships = new Set(
    fields.map((f) => f.voivodeship?.trim().toUpperCase()).filter(Boolean)
  )

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TableProperties className="h-5 w-5 text-primary" />
                {t('recordSheet.title')}
              </CardTitle>
              {fields.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {t('recordSheet.qsoCount', { count: fields.length })} · {t('recordSheet.pageCount', { count: totalPages })}
                </Badge>
              )}
            </div>

            <div className="flex items-center flex-wrap gap-2">
              {fields.length > 0 && (
                <>
                  <Badge variant="outline" className="text-xs gap-1 py-1">
                    <Sparkles className="h-3 w-3 text-amber-500" />
                    <span>{uniqueVoivodeships.size} / 16 {t('recordSheet.voivodeshipsCount')}</span>
                  </Badge>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSort}
                    className="gap-1.5 text-xs h-8"
                    title={t('recordSheet.sortTooltip')}
                  >
                    <ArrowDownUp className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{t('recordSheet.sortButton')}</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setClearDialogOpen(true)}
                    className="text-xs h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    <span className="hidden sm:inline">{t('recordSheet.clearAll')}</span>
                  </Button>
                </>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setImportDialogOpen(true)}
                className="gap-1.5 text-xs h-8 border-primary/40 hover:border-primary text-primary"
              >
                <Upload className="h-3.5 w-3.5" />
                {t('recordSheet.importAdif')}
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={openAddDialog}
                className="gap-1.5 text-xs h-8"
              >
                <Plus className="h-4 w-4" />
                {t('recordSheet.addRow')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {fields.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <TableProperties className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground mb-4">
                {t('recordSheet.noRows')}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setImportDialogOpen(true)}
                  className="gap-1.5"
                >
                  <Upload className="h-4 w-4" />
                  {t('recordSheet.importAdif')}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={openAddDialog}
                  className="gap-1.5"
                >
                  <Plus className="h-4 w-4" />
                  {t('recordSheet.addRow')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="w-12 text-center">{t('recordSheet.rowNumber')}</TableHead>
                      <TableHead>{t('recordSheet.columns.callsign')}</TableHead>
                      <TableHead>{t('recordSheet.columns.date')}</TableHead>
                      <TableHead>{t('recordSheet.columns.band')}</TableHead>
                      <TableHead>{t('recordSheet.columns.mode')}</TableHead>
                      <TableHead>{t('recordSheet.columns.voivodeship')}</TableHead>
                      <TableHead className="hidden sm:table-cell">{t('recordSheet.columns.remarks')}</TableHead>
                      <TableHead className="w-20"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedFields.map((field, pageRelativeIndex) => {
                      const actualIndex = startIndex + pageRelativeIndex
                      const watchedRow = form.watch(`contacts.${actualIndex}`) || field
                      const currentVoy = watchedRow.voivodeship || ''
                      return (
                        <TableRow key={field.id} className="group">
                          <TableCell className="text-center text-xs text-muted-foreground font-mono">
                            {actualIndex + 1}
                          </TableCell>
                          <TableCell className="font-mono text-sm uppercase font-medium">
                            {watchedRow.callsign}
                          </TableCell>
                          <TableCell className="font-mono text-sm">{watchedRow.date}</TableCell>
                          <TableCell className="text-sm">{watchedRow.band}</TableCell>
                          <TableCell className="text-sm">{watchedRow.mode}</TableCell>
                          <TableCell className="py-1">
                            <Select
                              value={currentVoy || 'none'}
                              onValueChange={(val) => {
                                const newVoy = val === 'none' ? '' : val
                                const updated = { ...watchedRow, voivodeship: newVoy }
                                update(actualIndex, updated)
                                form.setValue(`contacts.${actualIndex}.voivodeship`, newVoy, { shouldDirty: true })
                              }}
                            >
                              <SelectTrigger
                                className={`h-7 w-[68px] px-2 py-0 text-xs font-mono font-bold border transition-colors ${
                                  currentVoy
                                    ? 'border-primary/40 bg-primary/5 text-primary hover:bg-primary/10'
                                    : 'border-dashed border-muted-foreground/40 text-muted-foreground hover:border-primary/50'
                                }`}
                              >
                                <SelectValue placeholder="---">
                                  {currentVoy || '---'}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none" className="text-xs font-mono text-muted-foreground">
                                  ---
                                </SelectItem>
                                {VOIVODESHIPS.filter((v) => v.code).map((v) => (
                                  <SelectItem key={v.code} value={v.code} className="text-xs">
                                    <span className="font-mono font-bold mr-2 text-foreground">{v.code}</span>
                                    <span className="text-muted-foreground">({v.name})</span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                            {watchedRow.remarks}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => openEditDialog(actualIndex)}
                                aria-label={t('recordSheet.editRow')}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() => handleDelete(actualIndex)}
                                aria-label={t('recordSheet.deleteRow')}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Table Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-2 pt-1 text-sm text-muted-foreground">
                  <span className="text-xs">
                    {t('recordSheet.showingRows', {
                      start: startIndex + 1,
                      end: Math.min(startIndex + ROWS_PER_PAGE, fields.length),
                      total: fields.length,
                    })}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={safeCurrentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="h-8 w-8 p-0"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-xs px-2 font-medium text-foreground">
                      {safeCurrentPage} / {totalPages}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={safeCurrentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className="h-8 w-8 p-0"
                      aria-label="Next page"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {form.formState.errors.contacts?.root && (
            <p className="mt-2 text-sm text-destructive">
              {t('validation.minRows')}
            </p>
          )}
          {form.formState.errors.contacts?.message && (
            <p className="mt-2 text-sm text-destructive">
              {t('validation.minRows')}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit QSO Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editIndex !== null ? t('recordSheet.editRow') : t('recordSheet.addRow')}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {editIndex !== null ? t('recordSheet.editRow') : t('recordSheet.addRow')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="qso-callsign">{t('recordSheet.columns.callsign')}</Label>
                <Input
                  id="qso-callsign"
                  value={editData.callsign}
                  onChange={(e) => updateField('callsign', e.target.value.toUpperCase())}
                  className="uppercase font-mono"
                  placeholder="SP1ABC"
                />
                {editData.callsign.trim() && !isPolishCallsign(editData.callsign) && (
                  <p className="text-xs text-destructive font-medium">
                    {t('validation.invalidPolishCallsign')}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="qso-date">{t('recordSheet.columns.date')}</Label>
                <Input
                  id="qso-date"
                  type="date"
                  value={editData.date}
                  onChange={(e) => updateField('date', e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="qso-voivodeship">{t('recordSheet.columns.voivodeship')}</Label>
                <Select
                  value={editData.voivodeship || 'none'}
                  onValueChange={(v) => updateField('voivodeship', v === 'none' ? '' : v)}
                >
                  <SelectTrigger id="qso-voivodeship">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VOIVODESHIPS.map((v) => (
                      <SelectItem key={v.code || 'none'} value={v.code || 'none'}>
                        {v.code ? `${v.name} (${v.code})` : v.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="qso-band">{t('recordSheet.columns.band')}</Label>
                <Select
                  value={editData.band}
                  onValueChange={(v) => updateField('band', v)}
                >
                  <SelectTrigger id="qso-band">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BANDS.map((b) => (
                      <SelectItem key={b} value={b}>
                        {t(`recordSheet.bandOptions.${b}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="qso-mode">{t('recordSheet.columns.mode')}</Label>
                <Select
                  value={editData.mode}
                  onValueChange={(v) => updateField('mode', v)}
                >
                  <SelectTrigger id="qso-mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MODES.map((m) => (
                      <SelectItem key={m} value={m}>
                        {t(`recordSheet.modeOptions.${m}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-1">
              <div className="space-y-2">
                <Label htmlFor="qso-remarks">{t('recordSheet.columns.remarks')}</Label>
                <Input
                  id="qso-remarks"
                  value={editData.remarks}
                  onChange={(e) => updateField('remarks', e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:items-center">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={!editData.callsign || !editData.date || !isPolishCallsign(editData.callsign)}
            >
              {editIndex !== null ? t('common.save') : t('recordSheet.addRow')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ADIF Import Dialog */}
      <ImportQsoDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
      />

      {/* Clear All Confirmation Dialog */}
      <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('recordSheet.clearAllTitle')}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground py-2">
              {t('recordSheet.clearAllConfirm', { count: fields.length })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:items-center">
            <Button type="button" variant="outline" onClick={() => setClearDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="button" variant="destructive" onClick={handleClearAll}>
              {t('recordSheet.clearAll')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
