import type { Pagination } from '@/interfaces/pagination.interface'
import type { User, UserFilter, UpdateUserBody } from '@/interfaces/user.interface'
import { BaseApi } from '@/services/api/base-api.service'

class UserService extends BaseApi {
  private url = '/admin/users'

  async index(filter: UserFilter) {
    return this.execute<Pagination<User[]>>(() =>
      this.http.get<Pagination<User[]>>(this.url, { query: filter })
    )
  }

  async update(id: string, body: UpdateUserBody) {
    return this.execute<User>(() => this.http.put<User>(`${this.url}/${id}`, { body }))
  }
}

export const userService = new UserService()
