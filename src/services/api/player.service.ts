import type { Pagination } from '@/interfaces/pagination.interface'
import type {
  Player,
  PlayerFilter,
  PlayerDetail,
  PlayerInventory,
  PlayerEquipment,
  PlayerStatsResult,
  AddInventoryItemDto,
  PlayerMailAdminItem,
  PlayerMailFilter,
} from '@/interfaces/player.interface'
import { BaseApi } from '@/services/api/base-api.service'

class PlayerService extends BaseApi {
  private url = '/admin/players'

  async index(filter: PlayerFilter) {
    return this.execute<Pagination<Player[]>>(() =>
      this.http.get(this.url, { query: filter })
    )
  }

  async getById(id: string) {
    return this.execute<PlayerDetail>(() => this.http.get(`${this.url}/${id}`))
  }

  async getInventory(id: string) {
    return this.execute<PlayerInventory>(() =>
      this.http.get(`${this.url}/${id}/inventory`)
    )
  }

  async getEquipment(id: string) {
    return this.execute<PlayerEquipment>(() =>
      this.http.get(`${this.url}/${id}/equipment`)
    )
  }

  async getStats(id: string) {
    return this.execute<PlayerStatsResult>(() =>
      this.http.get(`${this.url}/${id}/stats`)
    )
  }

  async addInventoryItem(id: string, dto: AddInventoryItemDto) {
    return this.execute(() => this.http.post(`${this.url}/${id}/inventory`, { body: dto }))
  }

  async getMails(playerId: string, filter: PlayerMailFilter) {
    return this.execute<Pagination<PlayerMailAdminItem[]>>(() =>
      this.http.get(`${this.url}/${playerId}/mails`, {
        query: filter,
      })
    )
  }

  async removeInventoryItem(playerId: string, itemId: string) {
    return this.execute(() => this.http.delete(`${this.url}/${playerId}/inventory/${itemId}`))
  }

  async equipItem(playerId: string, dto: { slot: string; inventoryItemId: string }) {
    return this.execute(() =>
      this.http.post(`${this.url}/${playerId}/equipment/equip`, { body: dto })
    )
  }

  async unequipItem(playerId: string, slot: string) {
    return this.execute(() => this.http.delete(`${this.url}/${playerId}/equipment/${slot}`))
  }
}

export const playerService = new PlayerService()
