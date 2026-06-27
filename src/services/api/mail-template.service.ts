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
    return this.execute<Pagination<MailTemplate[]>>(() =>
      this.http.get(this.url, { query: filter })
    )
  }

  async getById(id: string) {
    return this.execute<MailTemplate>(() => this.http.get(`${this.url}/${id}`))
  }

  async create(dto: CreateMailTemplateDto) {
    return this.execute<MailTemplate>(() => this.http.post(this.url, { body: dto }))
  }

  async update(id: string, dto: UpdateMailTemplateDto) {
    return this.execute<MailTemplate>(() =>
      this.http.put(`${this.url}/${id}`, { body: dto })
    )
  }

  async delete(id: string) {
    return this.execute<MailTemplate>(() => this.http.delete(`${this.url}/${id}`))
  }
}

export const mailTemplateService = new MailTemplateService()
