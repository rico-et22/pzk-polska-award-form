import { useTranslation } from 'react-i18next'
import { Moon, Sun, Monitor, Languages } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from '@/hooks/useTheme'
import logoSrc from '@/assets/Logo_PZK.svg'

export function Header() {
  const { t, i18n } = useTranslation()
  const { theme, setTheme } = useTheme()
  const currentLang = i18n.language?.startsWith('pl') ? 'pl' : 'en'

  const toggleLang = () => {
    const newLang = currentLang === 'pl' ? 'en' : 'pl'
    i18n.changeLanguage(newLang)
    document.documentElement.lang = newLang
  }

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="mx-auto w-full max-w-[1000px] flex items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <img
            src={logoSrc}
            alt="PZK Logo"
            className="h-10 w-auto sm:h-12 dark:brightness-110"
          />
          <div className="min-w-0">
            <h1 className="text-base font-semibold leading-tight text-foreground sm:text-lg truncate">
              {t('header.title')}
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              {t('header.subtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Language toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLang}
            className="gap-1.5 text-xs sm:text-sm"
            aria-label={t('lang.switchTo')}
          >
            <Languages className="h-4 w-4" />
            <span className="font-medium">{currentLang === 'pl' ? t('lang.en') : t('lang.pl')}</span>
          </Button>

          {/* Theme toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
                <span className="sr-only">{t('theme.light')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('light')}>
                <Sun className="mr-2 h-4 w-4" />
                {t('theme.light')}
                {theme === 'light' && <span className="ml-auto text-primary">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                <Moon className="mr-2 h-4 w-4" />
                {t('theme.dark')}
                {theme === 'dark' && <span className="ml-auto text-primary">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                <Monitor className="mr-2 h-4 w-4" />
                {t('theme.system')}
                {theme === 'system' && <span className="ml-auto text-primary">✓</span>}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
