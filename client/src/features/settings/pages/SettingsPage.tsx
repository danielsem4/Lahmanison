import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Sun, Moon, Monitor, Eye, EyeOff, Loader2 } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/features/auth'
import { useThemeStore } from '@/stores/themeStore'
import type { Theme } from '@/stores/themeStore'
import { useChangePassword } from '../hooks/useChangePassword'
import {
  createChangePasswordSchema,
  type ChangePasswordFormData,
} from '../schemas/settings.schema'

const emptyPasswordValues: ChangePasswordFormData = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
}

export function SettingsPage() {
  const { t, i18n } = useTranslation('settings')
  const { user } = useAuth()
  const { theme, setTheme } = useThemeStore()

  const language = i18n.language.startsWith('he') ? 'he' : 'en'

  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const { mutate: changePassword, isPending } = useChangePassword()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const passwordSchema = useMemo(() => createChangePasswordSchema(t), [i18n.language])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: emptyPasswordValues,
  })

  function onChangePassword(data: ChangePasswordFormData) {
    changePassword(
      { currentPassword: data.currentPassword, newPassword: data.newPassword },
      { onSuccess: () => reset(emptyPasswordValues) },
    )
  }

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
                    {t(`account.role${user.role.charAt(0) + user.role.slice(1).toLowerCase()}`)}
                  </Badge>
                </dd>
              </div>
            </dl>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('security.title')}</CardTitle>
          <CardDescription>{t('security.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onChangePassword)}
            noValidate
            className="flex max-w-md flex-col gap-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword">{t('security.currentPasswordLabel')}</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrent ? 'text' : 'password'}
                  autoComplete="current-password"
                  disabled={isPending}
                  aria-invalid={!!errors.currentPassword}
                  className="pe-10"
                  {...register('currentPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((prev) => !prev)}
                  tabIndex={-1}
                  aria-label={showCurrent ? t('security.hidePassword') : t('security.showPassword')}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-xs text-destructive">{errors.currentPassword.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="newPassword">{t('security.newPasswordLabel')}</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNew ? 'text' : 'password'}
                  autoComplete="new-password"
                  disabled={isPending}
                  aria-invalid={!!errors.newPassword}
                  className="pe-10"
                  {...register('newPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((prev) => !prev)}
                  tabIndex={-1}
                  aria-label={showNew ? t('security.hidePassword') : t('security.showPassword')}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-xs text-destructive">{errors.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">{t('security.confirmPasswordLabel')}</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  disabled={isPending}
                  aria-invalid={!!errors.confirmPassword}
                  className="pe-10"
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((prev) => !prev)}
                  tabIndex={-1}
                  aria-label={showConfirm ? t('security.hidePassword') : t('security.showPassword')}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {t('security.submit')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
