import type { Pagination } from '@/interfaces/pagination.interface'
import type { CronLog, CronLogFilter } from '@/interfaces/cron-log.interface'
import { BaseApi } from '@/services/api/base-api.service'

class CronLogService extends BaseApi {
  private url = '/admin/cron-logs'

  async index(filter: CronLogFilter) {
    return this.execute<Pagination<CronLog[]>>(() =>
      this.http.get(this.url, { query: filter })
    )
  }

  async getById(id: string) {
    return this.execute<CronLog>(() => this.http.get(`${this.url}/${id}`))
  }

  async retry(id: string, params?: Record<string, unknown>) {
    return this.execute<CronLog>(() =>
      this.http.post(`${this.url}/${id}/retry`, { body: { params } })
    )
  }
}

export const cronLogService = new CronLogService()
