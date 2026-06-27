import type { Pagination } from '@/interfaces/pagination.interface'
import type { Admin, AdminFilter } from '@/interfaces/admin.interface'
import { BaseApi } from '@/services/api/base-api.service'

class AdminService extends BaseApi {
  private url = '/admin'

  async index(filter: AdminFilter) {
    return this.execute<Pagination<Admin[]>>(() =>
      this.http.get(this.url, { query: filter })
    )
  }
}

export const adminService = new AdminService()
