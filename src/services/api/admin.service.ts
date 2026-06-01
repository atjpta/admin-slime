import type { Pagination } from '@/interfaces/pagination.interface'
import type { User } from '@/interfaces/user.interface'
import { BaseApi } from '@/services/api/base-api.service'

class AdminService extends BaseApi {
  private url = '/admin'
  async index() {
    const res = await this.http.get(`${this.url}`)
    return this.unwrap<Pagination<User>>(res)
  }
}

export const adminService = new AdminService()
