import type { Pagination } from '@/interfaces/pagination.interface'
import type { BattleItem, BattleItemFilter } from '@/interfaces/battle-item.interface'
import { BaseApi } from '@/services/api/base-api.service'

class BattleItemService extends BaseApi {
  private url = '/admin/battle-items'

  async index(filter: BattleItemFilter) {
    return this.execute<Pagination<BattleItem[]>>(() =>
      this.http.get(this.url, { query: filter })
    )
  }
}

export const battleItemService = new BattleItemService()
