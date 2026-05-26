import { useTranslation } from 'react-i18next'
import { useFormContext } from 'react-hook-form'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { CATEGORIES, AWARD_CLASSES, type ApplicationFormData } from '@/schemas/applicationSchema'
import { ClipboardList } from 'lucide-react'

const RequiredStar = () => <span className="text-destructive ml-1">*</span>

export function ApplicationForm() {
  const { t, i18n } = useTranslation()
  const form = useFormContext<ApplicationFormData>()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ClipboardList className="h-5 w-5 text-primary" />
          {t('application.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Matrix & ApplyFor Checkboxes (moved up) */}
        <div className="space-y-4 pb-4 border-b border-border">
          <div className="space-y-3">
            <div>
              <p className="text-base font-medium">{t('application.category')}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{t('application.categoryNote')}</p>
            </div>
            
            <FormField
              control={form.control}
              name="applyFor"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-2"
                    >
                      <FormItem className="flex items-start space-x-3 space-y-0 p-3 border rounded-md transition-colors hover:bg-muted/50 has-[:checked]:bg-primary/5 has-[:checked]:border-primary/50">
                        <FormControl>
                          <RadioGroupItem value="new" className="mt-1" />
                        </FormControl>
                        <FormLabel className="font-normal leading-relaxed text-sm w-full cursor-pointer">
                          {t('application.applyForNewAward')}
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-start space-x-3 space-y-0 p-3 border rounded-md transition-colors hover:bg-muted/50 has-[:checked]:bg-primary/5 has-[:checked]:border-primary/50">
                        <FormControl>
                          <RadioGroupItem value="sticker" className="mt-1" />
                        </FormControl>
                        <FormLabel className="font-normal leading-relaxed text-sm w-full cursor-pointer">
                          {t('application.applyForSticker')}
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="previousEdition"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-3 border rounded-md transition-colors hover:bg-muted/50 has-[:checked]:bg-primary/5 has-[:checked]:border-primary/50">
                  <FormControl>
                    <input
                      type="checkbox"
                      className="h-4 w-4 shrink-0 mt-1 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal leading-relaxed text-sm cursor-pointer w-full">
                    {t('application.previousEdition')}
                  </FormLabel>
                </FormItem>
              )}
            />
            
            <CategoryClassMatrix />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="callsign"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('application.callsign')} <RequiredStar /></FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('application.callsignPlaceholder')}
                    className="uppercase"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="exCalls"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('application.exCalls')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('application.exCallsPlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('application.firstName')} <RequiredStar /></FormLabel>
                <FormControl>
                  <Input placeholder={t('application.firstNamePlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('application.lastName')} <RequiredStar /></FormLabel>
                <FormControl>
                  <Input placeholder={t('application.lastNamePlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Address */}
        <div className="space-y-3">
          <FormLabel>{t('application.address')} <RequiredStar /></FormLabel>
          <FormField
            control={form.control}
            name="address1"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder={t('application.address1Placeholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address2"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder={t('application.address2Placeholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="postcode"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input 
                      placeholder={t('application.postcodePlaceholder')} 
                      {...field}
                      onChange={(e) => {
                        let val = e.target.value
                        if (i18n.language === 'pl') {
                          val = val.replace(/[^\d]/g, '')
                          if (val.length > 2) val = val.substring(0, 2) + '-' + val.substring(2, 5)
                        }
                        field.onChange(val)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder={t('application.cityPlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="telephone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('application.telephone')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('application.telephonePlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('application.email')}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={t('application.emailPlaceholder')}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-3">
          <FormLabel>{t('application.issueTo')} <RequiredStar /></FormLabel>
          <FormField
            control={form.control}
            name="issueTo1"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder={t('application.issueTo1Placeholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="issueTo2"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder={t('application.issueTo2Placeholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="qthLocator"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('application.qthLocator')} <RequiredStar /></FormLabel>
                <FormControl>
                  <Input placeholder={t('application.qthLocatorPlaceholder')} className="uppercase" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Zone info */}
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
          <FormField
            control={form.control}
            name="ituZone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('application.ituZone')} <RequiredStar /></FormLabel>
                <FormControl>
                  <Input placeholder={t('application.ituZonePlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cqZone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('application.cqZone')} <RequiredStar /></FormLabel>
                <FormControl>
                  <Input placeholder={t('application.cqZonePlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Additional checkboxes and radios */}
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="pzkMember"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>{t('application.pzkMember')} <RequiredStar /></FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="yes" />
                        </FormControl>
                        <FormLabel className="font-normal">{t('common.yes')}</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="no" />
                        </FormControl>
                        <FormLabel className="font-normal">{t('common.no')}</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {i18n.language === 'pl' ? (
              <FormField
                control={form.control}
                name="feeAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('application.feeAmount')} <RequiredStar /></FormLabel>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input placeholder="0" className="w-24" {...field} />
                      </FormControl>
                      <span className="text-sm font-medium">PLN</span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <div className="space-y-6">
                <div className="space-y-3 pb-6 border-b border-border/50">
                  <h3 className="text-sm font-medium">{t('application.spdxContestHeader')}</h3>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="spDxContestYear"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox 
                              checked={!!field.value} 
                              onCheckedChange={(c: boolean) => {
                                if (!c) field.onChange('')
                                else field.onChange(new Date().getFullYear().toString())
                              }} 
                            />
                          </FormControl>
                          <FormLabel className="font-normal flex items-center space-x-2">
                            <span className="min-w-[120px]">{t('application.spdxContest')}</span>
                            <Input className="w-20 h-8" placeholder={t('application.yearPlaceholder')} {...field} value={field.value || ''} />
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="spDxRttyContestYear"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox 
                              checked={!!field.value} 
                              onCheckedChange={(c: boolean) => {
                                if (!c) field.onChange('')
                                else field.onChange(new Date().getFullYear().toString())
                              }} 
                            />
                          </FormControl>
                          <FormLabel className="font-normal flex items-center space-x-2">
                            <span className="min-w-[150px]">{t('application.spdxRttyContest')}</span>
                            <Input className="w-20 h-8" placeholder={t('application.yearPlaceholder')} {...field} value={field.value || ''} />
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <FormLabel>{t('application.feeAmount')} <RequiredStar /></FormLabel>
                  <div className="flex flex-wrap items-center gap-4">
                  {['Eur', 'Usd', 'Irc', 'Other'].map((curr) => (
                    <FormField
                      key={curr}
                      control={form.control}
                      name={`feeAmount${curr}` as any}
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <Input 
                              placeholder={curr === 'Other' ? t('common.other') : "0"} 
                              className={curr === 'Other' ? "w-24" : "w-16"} 
                              {...field}
                              value={field.value || ''}
                              onChange={(e) => {
                                field.onChange(e)
                                form.trigger('feeAmount')
                              }}
                            />
                          </FormControl>
                          <span className="text-sm font-medium">
                            {curr === 'Other' ? '' : curr.toUpperCase()}
                          </span>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <FormField
                  control={form.control}
                  name="feeAmount"
                  render={() => (
                    <FormItem>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            )}
          </div>
          
          {/* GCR List */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div>
              <h3 className="text-sm font-medium">{t('application.gcrList')}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{t('application.gcrDesc')}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="gcr1Name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('application.gcrName')} 1 <RequiredStar /></FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gcr1Callsign"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('application.gcrCallsign')} 1 <RequiredStar /></FormLabel>
                      <FormControl><Input className="uppercase" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="gcr2Name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('application.gcrName')} 2 <RequiredStar /></FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gcr2Callsign"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('application.gcrCallsign')} 2 <RequiredStar /></FormLabel>
                      <FormControl><Input className="uppercase" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CategoryClassMatrix() {
  const { t, i18n } = useTranslation()
  const isEn = i18n.language === 'en'
  const categoriesToRender = isEn ? CATEGORIES.filter(c => c !== 'junior') : CATEGORIES
  const form = useFormContext<ApplicationFormData>()
  const selections = form.watch('selections') || []

  const handleSelect = (category: typeof CATEGORIES[number], awardClass: typeof AWARD_CLASSES[number]) => {
    const val = `${category}:${awardClass}`
    if (selections.includes(val)) {
      form.setValue('selections', selections.filter(s => s !== val), { shouldValidate: true })
    } else {
      form.setValue('selections', [...selections, val], { shouldValidate: true })
    }
  }

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-left text-[10px] font-medium text-muted-foreground border border-border bg-muted/30">
                {/* empty corner */}
              </th>
              {categoriesToRender.map((cat) => (
                <th
                  key={cat}
                  className="p-2 text-center text-[10px] font-medium text-muted-foreground border border-border bg-muted/30 min-w-[50px] writing-mode-vertical"
                  style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                >
                  {t(`application.categories.${cat}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {AWARD_CLASSES.map((cls) => (
              <tr key={cls}>
                <td className="p-2 text-xs font-medium text-muted-foreground border border-border bg-muted/30 whitespace-nowrap">
                  {t(`application.awardClasses.${cls}`)}
                </td>
                {categoriesToRender.map((cat) => {
                  const isSelected = selections.includes(`${cat}:${cls}`)
                  return (
                    <td
                      key={`${cat}-${cls}`}
                      className="p-2 text-center border border-border"
                    >
                      <button
                        type="button"
                        onClick={() => handleSelect(cat, cls)}
                        className={`mx-auto flex h-5 w-5 items-center justify-center rounded-sm border-2 transition-all ${
                          isSelected
                            ? 'border-primary bg-primary text-primary-foreground scale-110'
                            : 'border-muted-foreground/30 hover:border-primary/50'
                        }`}
                        aria-label={`${t(`application.categories.${cat}`)} — ${t(`application.awardClasses.${cls}`)}`}
                        aria-pressed={isSelected}
                      >
                        {isSelected && (
                          <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
                            <path
                              d="M2.5 6L5 8.5L9.5 3.5"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Hidden input for validation message */}
      <FormField
        control={form.control}
        name="selections"
        render={() => (
          <FormItem className="mt-2">
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
