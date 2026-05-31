import { BaseApi } from './base-api.service'

interface LoginPayload {
  email: string
  password: string
}

interface LoginResponse {
  token: string
}

class AuthService extends BaseApi {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const res = await this.http.post<LoginPayload>('/admin/login', { body: payload })
    return this.unwrap<LoginResponse>(res)
  }
}

export const authService = new AuthService()
