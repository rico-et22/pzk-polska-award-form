import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm, FormProvider } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { Download, Loader2, CheckCircle2 } from 'lucide-react'
import { Header } from '@/components/Header'
import { Explanations } from '@/components/Explanations'
import { ApplicationForm } from '@/components/ApplicationForm'
import { RecordSheet } from '@/components/RecordSheet'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import {
  applicationSchema,
  type ApplicationFormData,
} from '@/schemas/applicationSchema'
import { generatePdf, downloadBlob } from '@/lib/pdf/generatePdf'
import { sortQsoContacts } from '@/lib/importers/qsoSorter'

function App() {
  const { t, i18n } = useTranslation()
  const [isGenerating, setIsGenerating] = useState(false)
  const [pdfStatus, setPdfStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const form = useForm<ApplicationFormData>({
    resolver: standardSchemaResolver(applicationSchema),
    defaultValues: {
      callsign: '',
      exCalls: '',
      firstName: '',
      lastName: '',
      address1: '',
      address2: '',
      city: '',
      postcode: '',
      telephone: '',
      email: '',
      issueTo1: '',
      issueTo2: '',
      previousEdition: false,
      pzkMember: undefined as unknown as 'yes' | 'no',
      feeAmount: '',
      feeAmountEur: '',
      feeAmountUsd: '',
      feeAmountOther: '',
      spDxContestYear: '',
      spDxRttyContestYear: '',
      qthLocator: '',
      ituZone: '',
      cqZone: '',
      applyFor: undefined as unknown as 'new' | 'sticker',
      gcr1Name: '',
      gcr1Callsign: '',
      gcr2Name: '',
      gcr2Callsign: '',
      selections: [],
      contacts: [],
      confirmation: false as unknown as true,
    },
    mode: 'onBlur',
  })

  // Re-run validation when language changes to translate messages
  useEffect(() => {
    if (form.formState.isSubmitted || Object.keys(form.formState.errors).length > 0) {
      form.trigger()
    }
  }, [i18n.language, form])

  const onSubmit = async (data: ApplicationFormData) => {
    setIsGenerating(true)
    setPdfStatus('idle')
    try {
      // Auto-sort contacts in form state and update table UI
      const sortedContacts = sortQsoContacts(data.contacts)
      form.setValue('contacts', sortedContacts, { shouldDirty: true })
      const updatedData = { ...data, contacts: sortedContacts }

      const locale = i18n.language?.startsWith('pl') ? 'pl' : 'en'
      const pdfBytes = await generatePdf(updatedData, locale as 'pl' | 'en')
      const filename = `Polska_Award_${data.callsign}_${new Date().toISOString().slice(0, 10)}.pdf`
      downloadBlob(pdfBytes, filename)
      setPdfStatus('success')
      setTimeout(() => setPdfStatus('idle'), 4000)
    } catch (err) {
      console.error('PDF generation failed:', err)
      setPdfStatus('error')
      setTimeout(() => setPdfStatus('idle'), 4000)
    } finally {
      setIsGenerating(false)
    }
  }

  const isDebug = typeof window !== 'undefined' && window.localStorage.getItem('debug') === 'true'

  const fillDebugData = () => {
    form.reset({
      callsign: 'SP1AAA',
      exCalls: 'SN1A',
      firstName: 'Jan',
      lastName: 'Kowalski',
      address1: 'ul. Krotka 1/2',
      address2: 'Skrytka pocztowa 44',
      city: 'Warszawa',
      postcode: '00-001',
      telephone: '123456789',
      email: 'jan@kowalski.pl',
      issueTo1: 'Jan Kowalski',
      issueTo2: 'SP1AAA',
      previousEdition: true,
      pzkMember: 'yes',
      feeAmount: '33',
      feeAmountEur: '10',
      feeAmountUsd: '11',
      feeAmountIrc: '8',
      feeAmountOther: '',
      qthLocator: 'JO72AA',
      ituZone: '28',
      cqZone: '15',
      applyFor: 'new',
      gcr1Name: 'Adam',
      gcr1Callsign: 'SP2BBB',
      gcr2Name: 'Ewa',
      gcr2Callsign: 'SP3CCC',
      selections: ['mixed:new', 'phone:new', 'cw:new', 'digi:class3', '160m:class2', '20m:class1', '2m:class1'],
      contacts: [
        { callsign: 'SN1A', date: '2024-05-01', band: '160m', mode: 'CW', voivodeship: 'D', remarks: '' },
        { callsign: 'SP2BBB', date: '2024-05-02', band: '20m', mode: 'SSB', voivodeship: 'M', remarks: 'test' },
      ],
      confirmation: true,
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto w-full max-w-[1000px] px-4 py-6 sm:px-6 sm:py-8 flex flex-col gap-6 sm:gap-8">
        {/* Backlink & PDF Note */}
        <div className="flex flex-col gap-2">
          <a 
            href={i18n.language.startsWith('pl') ? 'http://awards.pzk.org.pl/polskie-dyplomy/polska.html' : 'http://awards.pzk.org.pl/polish-awards/polska.html'}
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm font-medium text-primary hover:underline hover:opacity-80 transition-opacity w-fit flex items-center gap-1.5"
          >
            <span aria-hidden="true">&larr;</span> {t('header.backlink')}
          </a>
          <p className="text-sm text-muted-foreground font-medium">
            {t('header.pdfNote')}
          </p>
        </div>

        {/* Explanations */}
        <Explanations />

        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 sm:space-y-8 rounded-xl border border-border/50 bg-card p-4 sm:p-6 md:p-8 shadow-sm backdrop-blur-sm"
          >
            {isDebug && (
              <div className="flex justify-end -mb-4">
                <Button type="button" variant="outline" size="sm" onClick={fillDebugData}>
                  Fill Debug Data
                </Button>
              </div>
            )}



            {/* Application Data */}
            <ApplicationForm />

            {/* Record Sheet */}
            <RecordSheet />

            {/* Confirmation */}
            <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
              <FormField
                control={form.control}
                name="confirmation"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-start gap-3">
                      <FormControl>
                        <Checkbox
                          id="confirmation"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="mt-0.5"
                        />
                      </FormControl>
                      <Label
                        htmlFor="confirmation"
                        className="text-sm leading-relaxed cursor-pointer"
                      >
                        {t('confirmation.label')}
                      </Label>
                    </div>
                    <FormMessage className="ml-7" />
                  </FormItem>
                )}
              />
            </div>

            {/* Export Button */}
            <div className="flex flex-col items-center gap-3 pb-8">
              <Button
                type="submit"
                size="lg"
                disabled={isGenerating}
                className="gap-2 px-8 text-base"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {t('export.generating')}
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    {t('export.button')}
                  </>
                )}
              </Button>

              {pdfStatus === 'success' && (
                <p className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400 animate-in fade-in slide-in-from-bottom-2">
                  <CheckCircle2 className="h-4 w-4" />
                  {t('export.success')}
                </p>
              )}
              {pdfStatus === 'error' && (
                <p className="text-sm text-destructive animate-in fade-in slide-in-from-bottom-2">
                  {t('export.error')}
                </p>
              )}
            </div>
          </form>
        </FormProvider>
      </main>

      <footer className="border-t border-border bg-muted/30 py-4 text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
        Frontend made with ❤️+📻 by
        <a 
          href="https://kamilpawlak.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="font-medium underline underline-offset-2 hover:text-foreground transition-colors"
        >
          Kamil SO8KP
        </a>
      </footer>
    </div>
  )
}

export default App
