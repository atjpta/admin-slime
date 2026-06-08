import type { Pagination } from '@/interfaces/pagination.interface'
import type { Mail, MailDetail, MailFilter, SendMailDto, UpdateMailDto } from '@/interfaces/mail.interface'
import { BaseApi } from '@/services/api/base-api.service'

class MailService extends BaseApi {
  private url = '/admin/mails'

  async index(filter: MailFilter) {
    const res = await this.http.get(this.url, { query: filter })
    return this.unwrap<Pagination<Mail[]>>(res)
  }

  async getById(id: string) {
    const res = await this.http.get(`${this.url}/${id}`)
    return this.unwrap<MailDetail>(res)
  }

  async update(id: string, dto: UpdateMailDto) {
    const res = await this.http.put(`${this.url}/${id}`, { body: dto })
    return this.unwrap<Mail>(res)
  }

  async send(dto: SendMailDto) {
    const res = await this.http.post(this.url, { body: dto })
    return this.unwrap<Mail>(res)
  }

  async delete(id: string) {
    const res = await this.http.delete(`${this.url}/${id}`)
    return this.unwrap<Mail>(res)
  }
}

export const mailService = new MailService()
