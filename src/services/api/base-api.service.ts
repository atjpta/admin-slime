import { env } from '@/config/env'
import { Client } from '@colyseus/sdk'
import { localStorageService, LocalStorageKey } from '@/services/local-storage.service'

export const colyseus = new Client(env.WS_URL)

// Gắn token từ localStorage ngay khi khởi động
const savedToken = localStorageService.get<string>(LocalStorageKey.Token, '')
if (savedToken) colyseus.http.authToken = savedToken

export function setAuthToken(token: string) {
  colyseus.http.authToken = token
  localStorageService.set(LocalStorageKey.Token, token)
}

export function clearAuthToken() {
  colyseus.http.authToken = ''
  localStorageService.remove(LocalStorageKey.Token)
}

export interface ApiRes<T = unknown> {
  data: T
  message: string
  error: unknown
  code: string | null
}

export abstract class BaseApi {
  protected readonly http = colyseus.http

  protected unwrap<T>(res: { data: ApiRes<T> }): T {
    return res.data.data
  }
}
