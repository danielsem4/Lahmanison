import { useTranslation } from 'react-i18next'
import { BarChart3 } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function AnalyticsPage() {
  const { t } = useTranslation('analytics')

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('subtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
          <BarChart3 className="size-10" />
          <p>{t('comingSoon')}</p>
        </div>
      </CardContent>
    </Card>
  )
}
