export const MailSource = {
  SYSTEM: 'system',
  PLAYER: 'player',
} as const

export type MailSource = (typeof MailSource)[keyof typeof MailSource]

export const MailStatus = {
  UNREAD: 'unread',
  READ: 'read',
  CLAIMED: 'claimed',
  DELETED: 'deleted',
} as const

export type MailStatus = (typeof MailStatus)[keyof typeof MailStatus]
