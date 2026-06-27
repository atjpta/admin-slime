import type { Pagination } from '@/interfaces/pagination.interface'
import type {
  RankSession,
  RankSessionFilter,
  CreateRankSessionDto,
  UpdateRankSessionDto,
} from '@/interfaces/rank.interface'
import { BaseApi } from '@/services/api/base-api.service'

class RankSessionService extends BaseApi {
  private url = '/admin/rank-sessions'

  async index(filter: RankSessionFilter) {
    return this.execute<Pagination<RankSession[]>>(() =>
      this.http.get(this.url, { query: filter })
    )
  }

  async getById(id: string) {
    return this.execute<RankSession>(() => this.http.get(`${this.url}/${id}`))
  }

  async create(dto: CreateRankSessionDto) {
    return this.execute<RankSession>(() =>
      this.http.post(this.url, { body: dto })
    )
  }

  async update(id: string, dto: UpdateRankSessionDto) {
    return this.execute<RankSession>(() =>
      this.http.put(`${this.url}/${id}`, { body: dto })
    )
  }

  async remove(id: string) {
    return this.execute<RankSession>(() => this.http.delete(`${this.url}/${id}`))
  }
}

export const rankSessionService = new RankSessionService()
