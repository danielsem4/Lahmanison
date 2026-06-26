import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Navigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useLogin } from '../hooks/useLogin'
import { useAuth } from '../hooks/useAuth'
import { createLoginSchema, type LoginFormData } from '../schemas/auth.schema'

export function LoginPage() {
  const { t, i18n } = useTranslation('auth')
  const { isAuthenticated } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const { mutate: login, isPending } = useLogin()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const loginSchema = useMemo(() => createLoginSchema(t), [i18n.language])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  if (isAuthenticated) {
    return <Navigate to="/items" replace />
  }

  function onSubmit(data: LoginFormData) {
    login(data)
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img
            src="/lahmanison_logo_no_background.png"
            alt="Lahmanison"
            className="mx-auto mb-2 h-32 w-auto"
          />
          <CardTitle className="text-2xl">{t('login.title')}</CardTitle>
          <CardDescription>{t('login.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email">{t('login.emailLabel')}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder={t('login.emailPlaceholder')}
                disabled={isPending}
                aria-invalid={!!errors.email}
                {...register('email')}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">{t('login.passwordLabel')}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder={t('login.passwordPlaceholder')}
                  disabled={isPending}
                  aria-invalid={!!errors.password}
                  className="pe-10"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                  aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isPending ? t('login.submitting') : t('login.submit')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
