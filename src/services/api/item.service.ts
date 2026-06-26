import type { Pagination } from '@/interfaces/pagination.interface'
import type { Item, ItemFilter, EquipmentStat, RollConfig } from '@/interfaces/item.interface'
import { BaseApi } from '@/services/api/base-api.service'

class ItemService extends BaseApi {
  private url = '/admin/items'

  async index(filter: ItemFilter) {
    return this.execute<Pagination<Item[]>>(() =>
      this.http.get<Pagination<Item[]>>(this.url, { query: filter })
    )
  }

  async getByCode(code: string): Promise<Item | null> {
    const data = await this.execute<Pagination<Item[]>>(() =>
      this.http.get<Pagination<Item[]>>(this.url, { query: { search: code, limit: 10 } })
    )
    return data.items.find((i) => i.code === code) ?? null
  }

  async updateStats(id: string, body: { stats: EquipmentStat[] }) {
    return this.execute<Item>(() =>
      this.http.put<Item>(`${this.url}/${id}/equipment/stats`, { body })
    )
  }

  async updateRollConfig(id: string, body: RollConfig) {
    return this.execute<Item>(() =>
      this.http.put<Item>(`${this.url}/${id}/equipment/roll-config`, { body })
    )
  }

  async updateInfo(
    id: string,
    body: Partial<Pick<Item, 'type' | 'rarity' | 'status' | 'stackable' | 'sellPrice'>>
  ) {
    return this.execute<Item>(() => this.http.put<Item>(`${this.url}/${id}`, { body }))
  }
}

export const itemService = new ItemService()
