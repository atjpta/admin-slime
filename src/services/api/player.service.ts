import type { Pagination } from '@/interfaces/pagination.interface'
import type { Player, PlayerFilter } from '@/interfaces/player.interface'
import { BaseApi } from '@/services/api/base-api.service'

class PlayerService extends BaseApi {
  private url = '/admin/players'

  async index(filter: PlayerFilter) {
    const res = await this.http.get(`${this.url}`, { query: filter })
    return this.unwrap<Pagination<Player[]>>(res)
  }
}

export const playerService = new PlayerService()
