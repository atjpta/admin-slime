import type { Pagination } from '@/interfaces/pagination.interface'
import type {
  Gacha,
  GachaFilter,
  GachaCost,
  GachaRarity,
  UpdateGachaDto,
  CreateGachaDto,
  UpdateGachaRewardsDto,
  GachaHistory,
  GachaHistoryFilter,
} from '@/interfaces/gacha.interface'
import { BaseApi } from '@/services/api/base-api.service'

class GachaService extends BaseApi {
  private url = '/admin/gachas'

  async index(filter: GachaFilter) {
    return this.execute<Pagination<Gacha[]>>(() =>
      this.http.get(this.url, { query: filter })
    )
  }

  async getById(id: string) {
    return this.execute<Gacha>(() => this.http.get(`${this.url}/${id}`))
  }

  async create(dto: CreateGachaDto) {
    return this.execute<Gacha>(() => this.http.post(this.url, { body: dto }))
  }

  async update(id: string, dto: UpdateGachaDto) {
    return this.execute<Gacha>(() => this.http.put(`${this.url}/${id}`, { body: dto }))
  }

  async updateCosts(id: string, costs: GachaCost[]) {
    return this.execute<Gacha>(() =>
      this.http.put(`${this.url}/${id}/costs`, { body: { costs } })
    )
  }

  async updateRarities(id: string, rarities: GachaRarity[]) {
    return this.execute<Gacha>(() =>
      this.http.put(`${this.url}/${id}/rarities`, { body: { rarities } })
    )
  }

  async updateRewards(id: string, dto: UpdateGachaRewardsDto) {
    return this.execute<Gacha>(() =>
      this.http.put(`${this.url}/${id}/rewards`, { body: dto })
    )
  }

  async listHistories(filter: GachaHistoryFilter) {
    return this.execute<Pagination<GachaHistory[]>>(() =>
      this.http.get(`${this.url}/histories`, { query: filter })
    )
  }
}

export const gachaService = new GachaService()
