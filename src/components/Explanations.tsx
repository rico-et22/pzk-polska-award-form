import { useTranslation } from 'react-i18next'
import { Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function Explanations() {
  const { t } = useTranslation()

  // Use returnObjects to get the entire array of explanations
  const texts = t('explanations.texts', { returnObjects: true }) as string[]

  return (
    <Card className="border-primary/20 bg-primary/5 gap-3 py-4">
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center gap-2 text-base text-primary">
          <Info className="h-5 w-5 shrink-0" />
          {t('explanations.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-2 text-sm text-muted-foreground">
          {texts.map((text, i) => {
            const parts = text.split(/(https?:\/\/[^\s)]+)/)
            return (
              <li key={i} className="flex gap-2">
                <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary/40" />
                <span className="leading-relaxed">
                  {parts.map((part, j) => 
                    part.startsWith('http') ? (
                      <a key={j} href={part} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                        {part}
                      </a>
                    ) : (
                      <span key={j}>{part}</span>
                    )
                  )}
                </span>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
