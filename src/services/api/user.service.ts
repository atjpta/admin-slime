import type { Pagination } from '@/interfaces/pagination.interface'
import type { User, UserFilter, UpdateUserBody } from '@/interfaces/user.interface'
import { BaseApi } from '@/services/api/base-api.service'

class UserService extends BaseApi {
  private url = '/admin/users'
  async index(filter: UserFilter) {
    const res = await this.http.get(`${this.url}`, { query: filter })
    return this.unwrap<Pagination<User[]>>(res)
  }

  async update(id: string, body: UpdateUserBody) {
    await this.http.put(`${this.url}/${id}`, { body })
  }
}

export const userService = new UserService()
