import type { Pagination } from '@/interfaces/pagination.interface'
import type { Admin, AdminFilter } from '@/interfaces/admin.interface'
import { BaseApi } from '@/services/api/base-api.service'

class AdminService extends BaseApi {
  private url = '/admin'

  async index(filter: AdminFilter) {
    const res = await this.http.get(`${this.url}`, { query: filter })
    return this.unwrap<Pagination<Admin[]>>(res)
  }
}

export const adminService = new AdminService()
