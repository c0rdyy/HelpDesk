import { http } from './http'
import type {
  RequestCreatePayload,
  RequestListParams,
  RequestListResponse,
  RequestStatus,
  RequestUpdatePayload,
  HelpDeskRequest
} from './types'

function cleanParams(params: RequestListParams): RequestListParams {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== ''
    )
  ) as RequestListParams
}

export const requestsApi = {
  async getList(params: RequestListParams): Promise<RequestListResponse> {
    const { data } = await http.get<RequestListResponse>('/requests', {
      params: cleanParams(params)
    })

    return data
  },

  async create(payload: RequestCreatePayload): Promise<HelpDeskRequest> {
    const { data } = await http.post<HelpDeskRequest>('/requests', payload)

    return data
  },

  async updateStatus(
    id: number,
    status: RequestStatus
  ): Promise<HelpDeskRequest> {
    const { data } = await http.patch<HelpDeskRequest>(
      `/requests/${id}/status`,
      { status }
    )

    return data
  },

  async update(
    id: number,
    payload: RequestUpdatePayload
  ): Promise<HelpDeskRequest> {
    const { data } = await http.patch<HelpDeskRequest>(
      `/requests/${id}`,
      payload
    )

    return data
  },

  async delete(id: number): Promise<void> {
    await http.delete(`/requests/${id}`)
  }
}
