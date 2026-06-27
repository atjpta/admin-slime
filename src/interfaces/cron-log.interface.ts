import type { PaginationFilter } from '@/interfaces/pagination.interface'
import type { CronJobStatus, CronTriggerSource } from '@/enums/cron-log.enum'

export interface CronLog {
  _id: string
  jobName: string
  status: CronJobStatus
  triggeredBy: CronTriggerSource
  params: Record<string, unknown>
  startedAt: string
  finishedAt: string | null
  durationMs: number | null
  result: Record<string, unknown> | null
  error: string | null
  parentLogId: string | CronLog | null
  createdAt: string
  updatedAt: string
}

export interface CronLogFilter extends PaginationFilter {
  jobName?: string
  status?: CronJobStatus
  triggeredBy?: CronTriggerSource
}
