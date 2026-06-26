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
      this.http.get<Pagination<Mail[]>>(this.url, { query: filter })
    )
  }

  async getById(id: string) {
    return this.execute<MailDetail>(() => this.http.get<MailDetail>(`${this.url}/${id}`))
  }

  async update(id: string, dto: UpdateMailDto) {
    return this.execute<Mail>(() => this.http.put<Mail>(`${this.url}/${id}`, { body: dto }))
  }

  async send(dto: SendMailDto) {
    return this.execute<Mail>(() => this.http.post<Mail>(this.url, { body: dto }))
  }

  async delete(id: string) {
    return this.execute<Mail>(() => this.http.delete<Mail>(`${this.url}/${id}`))
  }
}

export const mailService = new MailService()
