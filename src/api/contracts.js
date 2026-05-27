import http from './client'
import { dispatch } from './client'

export const list = () =>
  http.get('/contracts').then(r => r.data)

export const getByEmployee = (employeeId) =>
  http.get(`/contracts/employee/${employeeId}`).then(r => r.data)

export const getById = (id) =>
  http.get(`/contracts/${id}`).then(r => r.data)

export const create = (payload) =>
  dispatch('CreateContract', payload)

export const updateStatus = (id, status) =>
  dispatch('UpdateContractStatus', { id, status })
