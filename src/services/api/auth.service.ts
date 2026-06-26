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
    return this.execute<LoginResponse>(() =>
      this.http.post<LoginResponse>('/admin/login', { body: payload })
    )
  }
}

export const authService = new AuthService()
