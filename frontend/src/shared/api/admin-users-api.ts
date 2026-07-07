import { http } from './http'
import type {
  AdminUserInfo,
  AdminUserListParams,
  AdminUserListResponse,
  UpdateUserBlockPayload,
  UpdateUserRolePayload
} from './types'

export const adminUsersApi = {
  async getList(params: AdminUserListParams): Promise<AdminUserListResponse> {
    const { data } = await http.get<AdminUserListResponse>('/admin/users', {
      params
    })

    return data
  },

  async updateRole(
    id: number,
    payload: UpdateUserRolePayload
  ): Promise<AdminUserInfo> {
    const { data } = await http.patch<AdminUserInfo>(
      `/admin/users/${id}/role`,
      payload
    )

    return data
  },

  async updateBlock(
    id: number,
    payload: UpdateUserBlockPayload
  ): Promise<AdminUserInfo> {
    const { data } = await http.patch<AdminUserInfo>(
      `/admin/users/${id}/block`,
      payload
    )

    return data
  }
}
