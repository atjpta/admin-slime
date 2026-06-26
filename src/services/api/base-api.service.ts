import { env } from '@/config/env'
import { Client } from '@colyseus/sdk'
import { localStorageService, LocalStorageKey } from '@/services/local-storage.service'
import router, { RouteName } from '@/router'
import { toast } from '@/utils/toast'
import { i18n } from '@/i18n'
import { parseApiError } from '@/utils/api-error'

export type FetchResponse<T> = {
  raw: Response
  data: T
  headers: Headers
  status: number
  statusText: string
}

export class ServerError<T> extends Error {
  code?: number
  headers?: Headers
  status?: number
  response?: Response
  data?: T
}

export enum HttpStatusCode {
  // 2xx
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,

  // 3xx
  MOVED_PERMANENTLY = 301,
  FOUND = 302,
  NOT_MODIFIED = 304,

  // 4xx
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  CONFLICT = 409,
  GONE = 410,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,

  // 5xx
  INTERNAL_SERVER_ERROR = 500,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
}

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

  protected async execute<T, E = any>(fn: () => Promise<FetchResponse<any>>) {
    try {
      const res = await fn()
      return this.unwrap<T>(res)
    } catch (error) {
      const serverError = error as ServerError<E>
      if (serverError.status === HttpStatusCode.UNAUTHORIZED) {
        toast.error(i18n.global.t('error.MISSING_TOKEN'))
        router.push({ name: RouteName.Login })
      } else {
        toast.error(parseApiError(error))
      }
      return Promise.reject(serverError.data as ApiRes<E>)
    }
  }

  protected unwrap<T>(res: { data: ApiRes<T> }): T {
    return res.data.data
  }
}
