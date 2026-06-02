import type { Pagination } from '@/interfaces/pagination.interface'
import type { Item, ItemFilter } from '@/interfaces/item.interface'
import { BaseApi } from '@/services/api/base-api.service'

class ItemService extends BaseApi {
  private url = '/admin/items'

  async index(filter: ItemFilter) {
    const res = await this.http.get(`${this.url}`, { query: filter })
    return this.unwrap<Pagination<Item[]>>(res)
  }
}

export const itemService = new ItemService()
