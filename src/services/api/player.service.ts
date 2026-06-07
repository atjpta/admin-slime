import type { Pagination } from '@/interfaces/pagination.interface'
import type {
  Player,
  PlayerFilter,
  PlayerDetail,
  PlayerInventory,
  PlayerEquipment,
  PlayerStatsResult,
  AddInventoryItemDto,
} from '@/interfaces/player.interface'
import { BaseApi } from '@/services/api/base-api.service'

class PlayerService extends BaseApi {
  private url = '/admin/players'

  async index(filter: PlayerFilter) {
    const res = await this.http.get(`${this.url}`, { query: filter })
    return this.unwrap<Pagination<Player[]>>(res)
  }

  async getById(id: string) {
    const res = await this.http.get(`${this.url}/${id}`)
    return this.unwrap<PlayerDetail>(res)
  }

  async getInventory(id: string) {
    const res = await this.http.get(`${this.url}/${id}/inventory`)
    return this.unwrap<PlayerInventory>(res)
  }

  async getEquipment(id: string) {
    const res = await this.http.get(`${this.url}/${id}/equipment`)
    return this.unwrap<PlayerEquipment>(res)
  }

  async getStats(id: string) {
    const res = await this.http.get(`${this.url}/${id}/stats`)
    return this.unwrap<PlayerStatsResult>(res)
  }

  async addInventoryItem(id: string, dto: AddInventoryItemDto) {
    const res = await this.http.post(`${this.url}/${id}/inventory`, { body: dto })
    return this.unwrap(res)
  }

  async removeInventoryItem(playerId: string, itemId: string) {
    const res = await this.http.delete(`${this.url}/${playerId}/inventory/${itemId}`)
    return this.unwrap(res)
  }

  async equipItem(playerId: string, dto: { slot: string; inventoryItemId: string }) {
    const res = await this.http.post(`${this.url}/${playerId}/equipment/equip`, { body: dto })
    return this.unwrap(res)
  }

  async unequipItem(playerId: string, slot: string) {
    const res = await this.http.delete(`${this.url}/${playerId}/equipment/${slot}`)
    return this.unwrap(res)
  }
}

export const playerService = new PlayerService()
