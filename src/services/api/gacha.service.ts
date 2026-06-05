import type { Pagination } from '@/interfaces/pagination.interface'
import type {
  Gacha,
  GachaFilter,
  GachaCost,
  GachaRarity,
  UpdateGachaDto,
  CreateGachaDto,
  UpdateGachaRewardsDto,
} from '@/interfaces/gacha.interface'
import { BaseApi } from '@/services/api/base-api.service'

class GachaService extends BaseApi {
  private url = '/admin/gachas'

  async index(filter: GachaFilter) {
    const res = await this.http.get(this.url, { query: filter })
    return this.unwrap<Pagination<Gacha[]>>(res)
  }

  async getById(id: string) {
    const res = await this.http.get(`${this.url}/${id}`)
    return this.unwrap<Gacha>(res)
  }

  async create(dto: CreateGachaDto) {
    const res = await this.http.post(this.url, { body: dto })
    return this.unwrap<Gacha>(res)
  }

  async update(id: string, dto: UpdateGachaDto) {
    const res = await this.http.put(`${this.url}/${id}`, { body: dto })
    return this.unwrap<Gacha>(res)
  }

  async updateCosts(id: string, costs: GachaCost[]) {
    const res = await this.http.put(`${this.url}/${id}/costs`, { body: { costs } })
    return this.unwrap<Gacha>(res)
  }

  async updateRarities(id: string, rarities: GachaRarity[]) {
    const res = await this.http.put(`${this.url}/${id}/rarities`, { body: { rarities } })
    return this.unwrap<Gacha>(res)
  }

  async updateRewards(id: string, dto: UpdateGachaRewardsDto) {
    const res = await this.http.put(`${this.url}/${id}/rewards`, { body: dto })
    return this.unwrap<Gacha>(res)
  }
}

export const gachaService = new GachaService()
