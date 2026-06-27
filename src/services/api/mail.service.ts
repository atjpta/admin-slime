import type { Pagination } from '@/interfaces/pagination.interface'
import type {
  Mail,
  MailDetail,
  MailFilter,
  SendMailDto,
  UpdateMailDto,
} from '@/interfaces/mail.interface'
import { BaseApi } from '@/services/api/base-api.service'

class MailService extends BaseApi {
  private url = '/admin/mails'

  async index(filter: MailFilter) {
    return this.execute<Pagination<Mail[]>>(() =>
      this.http.get(this.url, { query: filter })
    )
  }

  async getById(id: string) {
    return this.execute<MailDetail>(() => this.http.get(`${this.url}/${id}`))
  }

  async update(id: string, dto: UpdateMailDto) {
    return this.execute<Mail>(() => this.http.put(`${this.url}/${id}`, { body: dto }))
  }

  async send(dto: SendMailDto) {
    return this.execute<Mail>(() => this.http.post(this.url, { body: dto }))
  }

  async resend(id: string) {
    return this.execute<{ sent: number }>(() => this.http.post(`${this.url}/${id}/resend`))
  }

  async delete(id: string) {
    return this.execute<Mail>(() => this.http.delete(`${this.url}/${id}`))
  }
}

export const mailService = new MailService()
