import { i18n } from '@/i18n'
import type { ApiRes } from '@/services/api/base-api.service'

export function parseApiError(err: any): string {
  const res = err.data as ApiRes

  if (res?.code) {
    const key = `error.${res.code}`
    const translated = i18n.global.t(key)
    if (translated !== key) return translated
  }

  if (res?.message) return res.message

  return i18n.global.t('error.unknown')
}
