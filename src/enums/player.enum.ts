export const PlayerStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const
export type PlayerStatus = (typeof PlayerStatus)[keyof typeof PlayerStatus]

export const PlayerRole = {
  PLAYER: 'player',
  BOT: 'bot',
} as const
export type PlayerRole = (typeof PlayerRole)[keyof typeof PlayerRole]
