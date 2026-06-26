import { toast as _toast } from 'vue-sonner'

const PORTAL_ID = 'toast-portal'

function refreshPortal() {
  const el = document.getElementById(PORTAL_ID)
  if (!el) return
  try {
    ;(el as any).hidePopover()
  } catch {
    /* not yet shown */
  }
  ;(el as any).showPopover()
}

type Toast = typeof _toast

const wrapped = ((...args: Parameters<Toast>) => {
  refreshPortal()
  return _toast(...args)
}) as Toast

// wrap all methods (success, error, loading, etc.)
for (const key of Object.keys(_toast) as (keyof Toast)[]) {
  const fn = _toast[key]
  if (typeof fn === 'function') {
    ;(wrapped as any)[key] = (...args: unknown[]) => {
      refreshPortal()
      return (fn as (...a: unknown[]) => unknown).apply(_toast, args)
    }
  }
}

export const toast = wrapped
