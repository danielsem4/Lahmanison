import { useTranslation } from 'react-i18next'
import { Sun, Moon, Monitor } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/features/auth'
import { useThemeStore } from '@/stores/themeStore'
import type { Theme } from '@/stores/themeStore'

export function SettingsPage() {
  const { t, i18n } = useTranslation('settings')
  const { user } = useAuth()
  const { theme, setTheme } = useThemeStore()

  const language = i18n.language.startsWith('he') ? 'he' : 'en'

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('appearance.title')}</CardTitle>
          <CardDescription>{t('appearance.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label>{t('appearance.theme')}</Label>
            <ToggleGroup
              type="single"
              variant="outline"
              value={theme}
              onValueChange={(value) => value && setTheme(value as Theme)}
            >
              <ToggleGroupItem value="light">
                <Sun className="size-4" />
                {t('appearance.themeLight')}
              </ToggleGroupItem>
              <ToggleGroupItem value="dark">
                <Moon className="size-4" />
                {t('appearance.themeDark')}
              </ToggleGroupItem>
              <ToggleGroupItem value="system">
                <Monitor className="size-4" />
                {t('appearance.themeSystem')}
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="flex flex-col gap-2">
            <Label>{t('appearance.language')}</Label>
            <ToggleGroup
              type="single"
              variant="outline"
              value={language}
              onValueChange={(value) => value && void i18n.changeLanguage(value)}
            >
              <ToggleGroupItem value="en">English</ToggleGroupItem>
              <ToggleGroupItem value="he">עברית</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('account.title')}</CardTitle>
          <CardDescription>{t('account.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          {user ? (
            <dl className="flex flex-col">
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="text-sm font-medium text-muted-foreground">{t('account.name')}</dt>
                <dd className="text-sm font-medium">{user.name}</dd>
              </div>
              <Separator />
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="text-sm font-medium text-muted-foreground">{t('account.email')}</dt>
                <dd className="text-sm font-medium">{user.email}</dd>
              </div>
              <Separator />
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="text-sm font-medium text-muted-foreground">{t('account.role')}</dt>
                <dd>
                  <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                    {user.role === 'ADMIN' ? t('account.roleAdmin') : t('account.roleUser')}
                  </Badge>
                </dd>
              </div>
            </dl>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
