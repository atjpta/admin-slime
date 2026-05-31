import { useI18n } from 'vue-i18n'
import { ZodError, type ZodType } from 'zod'

type ZodIssue = InstanceType<typeof ZodError>['issues'][number]

function issueToI18nKey(issue: ZodIssue): [string, Record<string, unknown>] {
  switch (issue.code) {
    case 'too_small':
      return ['validation.min', { min: (issue as { minimum: unknown }).minimum }]
    case 'too_big':
      return ['validation.max', { max: (issue as { maximum: unknown }).maximum }]
    case 'invalid_format':
      return [`validation.${(issue as { format: string }).format}`, {}]
    case 'invalid_type':
      return ['validation.required', {}]
    default:
      return ['validation.invalid', {}]
  }
}

export function useZodForm() {
  const { t } = useI18n()

  /** Trả về validator function cho từng field của TanStack Form */
  function fieldValidator<T>(schema: ZodType<T>) {
    return ({ value }: { value: T }) => {
      const result = schema.safeParse(value)
      if (result.success) return undefined
      const [key, params] = issueToI18nKey(result.error.issues[0])
      return t(key, params)
    }
  }

  return { fieldValidator }
}
