import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useFormContext, useFieldArray } from 'react-hook-form'
import { Plus, Pencil, Trash2, TableProperties } from 'lucide-react'
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
  type ApplicationFormData,
  type QsoRow,
} from '@/schemas/applicationSchema'

const emptyRow: QsoRow = {
  callsign: '',
  date: '',
  band: '20m',
  mode: 'SSB',
  voivodeship: '',
  remarks: '',
}

export function RecordSheet() {
  const { t } = useTranslation()
  const form = useFormContext<ApplicationFormData>()
  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: 'contacts',
  })

  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [editData, setEditData] = useState<QsoRow>(emptyRow)
  const [dialogOpen, setDialogOpen] = useState(false)

  const openAddDialog = () => {
    setEditIndex(null)
    setEditData({ ...emptyRow })
    setDialogOpen(true)
  }

  const openEditDialog = (index: number) => {
    setEditIndex(index)
    setEditData({ ...fields[index] })
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (editIndex !== null) {
      update(editIndex, editData)
    } else {
      append(editData)
    }
    setDialogOpen(false)
  }

  const handleDelete = (index: number) => {
    remove(index)
  }

  const updateField = (field: keyof QsoRow, value: string) => {
    setEditData((prev) => ({ ...prev, [field]: value }))
  }

  const ROWS_PER_PAGE = 30
  const totalPages = Math.max(1, Math.ceil(fields.length / ROWS_PER_PAGE))

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TableProperties className="h-5 w-5 text-primary" />
              {t('recordSheet.title')}
            </CardTitle>
            <div className="flex items-center gap-2">
              {fields.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {fields.length} QSO{fields.length !== 1 ? 's' : ''} · {totalPages}{' '}
                  {t('recordSheet.page').toLowerCase()}
                  {totalPages !== 1 ? '.' : ''}
                </Badge>
              )}
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
        </CardHeader>
        <CardContent>
          {fields.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <TableProperties className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                {t('recordSheet.noRows')}
              </p>
            </div>
          ) : (
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
                  {fields.map((field, index) => (
                    <TableRow key={field.id} className="group">
                      <TableCell className="text-center text-xs text-muted-foreground font-mono">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-mono text-sm uppercase font-medium">
                        {field.callsign}
                      </TableCell>
                      <TableCell className="font-mono text-sm">{field.date}</TableCell>
                      <TableCell className="text-sm">{field.band}</TableCell>
                      <TableCell className="text-sm">{field.mode}</TableCell>
                      <TableCell className="font-mono text-sm">{field.voivodeship}</TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {field.remarks}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => openEditDialog(index)}
                            aria-label={t('recordSheet.editRow')}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(index)}
                            aria-label={t('recordSheet.deleteRow')}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={!editData.callsign || !editData.date}
            >
              {editIndex !== null ? t('recordSheet.editRow') : t('recordSheet.addRow')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
