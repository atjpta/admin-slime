import type { Pagination } from '@/interfaces/pagination.interface'
import type {
  MailTemplate,
  MailTemplateFilter,
  CreateMailTemplateDto,
  UpdateMailTemplateDto,
} from '@/interfaces/mail.interface'
import { BaseApi } from '@/services/api/base-api.service'

class MailTemplateService extends BaseApi {
  private url = '/admin/mail-templates'

  async index(filter: MailTemplateFilter) {
    const res = await this.http.get(this.url, { query: filter })
    return this.unwrap<Pagination<MailTemplate[]>>(res)
  }

  async getById(id: string) {
    const res = await this.http.get(`${this.url}/${id}`)
    return this.unwrap<MailTemplate>(res)
  }

  async create(dto: CreateMailTemplateDto) {
    const res = await this.http.post(this.url, { body: dto })
    return this.unwrap<MailTemplate>(res)
  }

  async update(id: string, dto: UpdateMailTemplateDto) {
    const res = await this.http.put(`${this.url}/${id}`, { body: dto })
    return this.unwrap<MailTemplate>(res)
  }

  async delete(id: string) {
    const res = await this.http.delete(`${this.url}/${id}`)
    return this.unwrap<MailTemplate>(res)
  }
}

export const mailTemplateService = new MailTemplateService()
