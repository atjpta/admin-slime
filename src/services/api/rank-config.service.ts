import type { Pagination } from '@/interfaces/pagination.interface'
import type {
  RankConfig,
  RankConfigFilter,
  CreateRankConfigDto,
  UpdateRankConfigDto,
  CloneRankConfigDto,
} from '@/interfaces/rank.interface'
import { BaseApi } from '@/services/api/base-api.service'

class RankConfigService extends BaseApi {
  private url = '/admin/rank-configs'

  async index(filter: RankConfigFilter) {
    return this.execute<Pagination<RankConfig[]>>(() =>
      this.http.get(this.url, { query: filter })
    )
  }

  async getById(id: string) {
    return this.execute<RankConfig>(() => this.http.get(`${this.url}/${id}`))
  }

  async create(dto: CreateRankConfigDto) {
    return this.execute<RankConfig>(() => this.http.post(this.url, { body: dto }))
  }

  async update(id: string, dto: UpdateRankConfigDto) {
    return this.execute<RankConfig>(() =>
      this.http.put(`${this.url}/${id}`, { body: dto })
    )
  }

  async clone(id: string, dto: CloneRankConfigDto) {
    return this.execute<RankConfig>(() =>
      this.http.post(`${this.url}/${id}/clone`, { body: dto })
    )
  }

  async remove(id: string) {
    return this.execute<RankConfig>(() => this.http.delete(`${this.url}/${id}`))
  }
}

export const rankConfigService = new RankConfigService()
