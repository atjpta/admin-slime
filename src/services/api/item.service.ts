import type { Pagination } from '@/interfaces/pagination.interface'
import type { Item, ItemFilter } from '@/interfaces/item.interface'
import { BaseApi } from '@/services/api/base-api.service'

class ItemService extends BaseApi {
  private url = '/admin/items'

  async index(filter: ItemFilter) {
    const res = await this.http.get(`${this.url}`, { query: filter })
    return this.unwrap<Pagination<Item[]>>(res)
  }

  async getByCode(code: string): Promise<Item | null> {
    const res = await this.http.get(`${this.url}`, { query: { search: code, limit: 10 } })
    const data = this.unwrap<Pagination<Item[]>>(res)
    return data.items.find((i) => i.code === code) ?? null
  }
}

export const itemService = new ItemService()
