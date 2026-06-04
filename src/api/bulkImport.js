import http from './client'

export const bulkImport = {
  async downloadTemplate(entity) {
    const res = await http.get(`/admin/bulk-import/template/${entity}`, { responseType: 'blob' })
    const url  = URL.createObjectURL(new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }))
    const link = document.createElement('a')
    link.href  = url
    link.download = `plantilla_${entity}.xlsx`
    link.click()
    URL.revokeObjectURL(url)
  },
  upload(entity, file) {
    const form = new FormData()
    form.append('file', file)
    return http.post(`/admin/bulk-import/${entity}`, form).then(r => r.data)
  },
}
