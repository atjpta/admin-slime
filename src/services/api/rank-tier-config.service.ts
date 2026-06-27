import type { Pagination } from '@/interfaces/pagination.interface'
import type {
  RankTierConfig,
  RankTierConfigFilter,
  CreateRankTierConfigDto,
  UpdateRankTierConfigDto,
} from '@/interfaces/rank.interface'
import { BaseApi } from '@/services/api/base-api.service'

class RankTierConfigService extends BaseApi {
  private url = '/admin/rank-tier-configs'

  async index(filter: RankTierConfigFilter) {
    return this.execute<Pagination<RankTierConfig[]>>(() =>
      this.http.get(this.url, { query: filter })
    )
  }

  async create(dto: CreateRankTierConfigDto) {
    return this.execute<RankTierConfig>(() =>
      this.http.post(this.url, { body: dto })
    )
  }

  async update(id: string, dto: UpdateRankTierConfigDto) {
    return this.execute<RankTierConfig>(() =>
      this.http.put(`${this.url}/${id}`, { body: dto })
    )
  }

  async remove(id: string) {
    return this.execute<RankTierConfig>(() =>
      this.http.delete(`${this.url}/${id}`)
    )
  }
}

export const rankTierConfigService = new RankTierConfigService()
