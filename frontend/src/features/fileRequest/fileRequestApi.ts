import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import API_BASE_URL from '@/lib/apiConfig';

export interface FileRequest {
  id: string;
  employee_id: string;
  file_id: string;
  document_type_ids: string[];
  requested_by_user_id: string;
  requested_by_name: string;
  requested_by_department?: string;
  status: string;
  remarks?: string;
  created_at?: string;
}

export interface FileMovement {
  id: number;
  employee_id: string;
  file_id: string;
  by_user_id: string;
  by_user_name?: string;
  from_location?: string;
  to_location?: string;
  to_assignee_user_id?: string;
  to_assignee_name?: string;
  action: string;
  timestamp: string;
  remarks?: string;
}

export const fileRequestApi = createApi({
  reducerPath: 'fileRequestApi',
  baseQuery: fetchBaseQuery({ baseUrl: `${API_BASE_URL}/api` }),
  tagTypes: ['FileRequests', 'FileMovements'],
  endpoints: (build) => ({
    // FILE REQUESTS
    getAllFileRequests: build.query<FileRequest[], void>({
      query: () => '/file_requests',
      providesTags: ['FileRequests'],
    }),

    getFileRequestsByEmployee: build.query<FileRequest[], string>({
      query: (employee_id) => `/file_requests/${employee_id}`,
      providesTags: ['FileRequests'],
    }),

    getFileRequestsByStatus: build.query<FileRequest[], string>({
      query: (status) => `/file_requests/status?status=${status}`,
      providesTags: ['FileRequests'],
    }),

    requestFile: build.mutation<FileRequest, Omit<FileRequest, 'id' | 'status' | 'created_at'>>({
      query: (body) => ({
        url: '/file_requests',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['FileRequests'],
    }),

    approveFileRequest: build.mutation<FileRequest, { requestId: string; registry_user_id: string; registry_user_name: string; to_location: string; to_assignee_user_id?: string; to_assignee_name?: string; remarks?: string }>({
      query: ({ requestId, ...body }) => ({
        url: `/file_requests/${requestId}/approve`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['FileRequests', 'FileMovements'],
    }),

    rejectFileRequest: build.mutation<FileRequest, { requestId: string; remarks?: string }>({
      query: ({ requestId, ...body }) => ({
        url: `/file_requests/${requestId}/reject`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['FileRequests'],
    }),

    // FILE MOVEMENTS
    getAllFileMovements: build.query<FileMovement[], void>({
      query: () => '/file_movements',
      providesTags: ['FileMovements'],
    }),

    getFileMovementsByEmployee: build.query<FileMovement[], string>({
      query: (employeeId) => `/file_movements/${employeeId}`,
      providesTags: ['FileMovements'],
    }),

    returnFile: build.mutation<FileMovement, { requestId: string; remarks?: string }>({
      query: ({ requestId, ...body }) => ({
        url: `/file_requests/${requestId}/return`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['FileMovements', 'FileRequests'],
    }),
  }),
});

export const {
  useGetAllFileRequestsQuery,
  useGetFileRequestsByStatusQuery,
  useGetFileRequestsByEmployeeQuery,
  useRequestFileMutation,
  useApproveFileRequestMutation,
  useRejectFileRequestMutation,
  useGetAllFileMovementsQuery,
  useGetFileMovementsByEmployeeQuery,
  useReturnFileMutation,
} = fileRequestApi;

export default fileRequestApi;
