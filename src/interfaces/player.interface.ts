import type { BaseResource } from '@/interfaces/base-resource.interface'
import type { PaginationFilter } from '@/interfaces/pagination.interface'
import type { PlayerRole, PlayerStatus } from '@/enums/player.enum'
import type { ItemRarity, ItemStatus, ItemType, EquipmentSlot, ItemSource } from '@/enums/item.enum'
import type { StatKey, StatType, StatSource } from '@/enums/stat.enum'

export interface Player extends BaseResource {
  name: string
  role: PlayerRole
  status: PlayerStatus
  user: { _id: string; email: string }
}

export interface PlayerFilter extends PaginationFilter {
  status?: PlayerStatus
  role?: PlayerRole
}

// --- Detail ---

export interface PlayerStat {
  stat: StatKey
  type: StatType
  value: number
  source: StatSource
}

export interface PlayerDetail extends BaseResource {
  name: string
  role: PlayerRole
  status: PlayerStatus
  user: { _id: string; email: string; status: string }
  stats: PlayerStat[]
  skills: { skill: { _id: string; code: string; type: string }; orderIndex: number }[]
}

// --- Inventory ---

export interface ItemMetadataStat {
  stat: StatKey
  type: StatType
  value: number
}

export interface EquipmentItemMetadata {
  slot: EquipmentSlot
  stats: ItemMetadataStat[]
}

export interface EquipmentInstanceMetadata {
  rarityStats?: ItemMetadataStat[]
}

export interface InventoryItemDef {
  _id: string
  code: string
  type: ItemType
  rarity: ItemRarity
  status: ItemStatus
  stackable: boolean
  sellPrice: number
  metadata: EquipmentItemMetadata | Record<string, unknown>
}

export interface InventoryItem {
  _id: string
  item: InventoryItemDef
  quantity: number
  orderIndex: number
  source: ItemSource
  locked: boolean
  metadata: EquipmentItemMetadata | Record<string, unknown>
}

export interface PlayerInventory {
  _id: string
  player: string
  items: InventoryItem[]
}

// --- Equipment ---

export interface EquipmentSlotData {
  slot: EquipmentSlot
  item: InventoryItemDef
  source: ItemSource
  locked: boolean
  metadata: EquipmentItemMetadata | Record<string, unknown>
}

export interface PlayerEquipment {
  _id: string
  player: string
  slots: EquipmentSlotData[]
}

// --- Add inventory item ---

export interface AddInventoryItemRarityStat {
  stat: string
  type: string
  value: number
}

export interface AddInventoryItemDto {
  itemCode: string
  rarity?: string
  source?: string
  rarityStats?: AddInventoryItemRarityStat[]
}

// --- Stats summary ---

export interface PlayerStatsSummary {
  hp: number
  attack: number
  magic: number
  defense: number
}

export interface PlayerStatsResult {
  stats: PlayerStatsSummary
  statsDetail: PlayerStat[]
}
