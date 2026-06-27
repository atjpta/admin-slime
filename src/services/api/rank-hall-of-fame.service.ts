import type { Pagination } from '@/interfaces/pagination.interface'
import type { RankHallOfFame, RankHallOfFameFilter } from '@/interfaces/rank.interface'
import { BaseApi } from '@/services/api/base-api.service'

class RankHallOfFameService extends BaseApi {
  private url = '/admin/rank-hall-of-fames'

  async index(filter: RankHallOfFameFilter) {
    return this.execute<Pagination<RankHallOfFame[]>>(() =>
      this.http.get(this.url, { query: filter })
    )
  }
}

export const rankHallOfFameService = new RankHallOfFameService()
