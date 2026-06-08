import type { BaseResource } from '@/interfaces/base-resource.interface'
import type { PaginationFilter } from '@/interfaces/pagination.interface'
import type { MailSource } from '@/enums/mail.enum'
import type { CurrencyCode } from '@/enums/gacha.enum'
import type { ItemSource, ItemType, ItemRarity, ItemStatus } from '@/enums/item.enum'
import type { ItemEquipmentMetadata } from '@/interfaces/item.interface'

export interface LocalizedString {
  vi: string
  en: string
}

export interface CurrencyReward {
  type: CurrencyCode
  value: number
}

export interface ItemReward {
  item: string
  quantity: number
  source: ItemSource
  metadata: Record<string, unknown>
}

export interface MailRewards {
  currency: CurrencyReward[]
  items: ItemReward[]
}

export interface PopulatedItemRef {
  _id: string
  code: string
  type: ItemType
  rarity: ItemRarity
  status: ItemStatus
  metadata: ItemEquipmentMetadata | Record<string, unknown>
}

export interface PopulatedItemReward {
  item: PopulatedItemRef
  quantity: number
  source: ItemSource
  metadata: Record<string, unknown>
}

export interface PopulatedMailRewards {
  currency: CurrencyReward[]
  items: PopulatedItemReward[]
}

export interface MailDetail extends Omit<Mail, 'rewards'> {
  rewards: PopulatedMailRewards
}

export interface MailReceiver {
  _id: string
  name: string
}

export interface Mail extends BaseResource {
  receivers: MailReceiver[]
  title: LocalizedString
  content: LocalizedString
  rewards: MailRewards
  expiredAt: string | null
  source: MailSource
  sendToNewPlayers: boolean
}

export interface MailFilter extends PaginationFilter {
  source?: MailSource
}

export interface UpdateMailDto {
  sendToNewPlayers: boolean
}

export interface SendMailDto {
  templateId?: string
  title?: LocalizedString
  content?: LocalizedString
  expirationDuration?: number
  rewards?: MailRewards
  receivers: 'all' | string[]
  sendToNewPlayers?: boolean
  saveAsTemplate?: { name: string }
}

// --- Mail Template ---

export interface MailTemplate extends BaseResource {
  name: string
  title: LocalizedString
  content: LocalizedString
  expirationDuration: number
}

export interface MailTemplateFilter extends PaginationFilter {}

export interface CreateMailTemplateDto {
  name: string
  title: LocalizedString
  content: LocalizedString
  expirationDuration: number
}

export type UpdateMailTemplateDto = Partial<CreateMailTemplateDto>
