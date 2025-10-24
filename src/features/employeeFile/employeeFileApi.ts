import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import API_BASE_URL from '@/lib/apiConfig';

// Small typed shapes for this API
export interface EmployeeFile {
  id: string;
  employee_id: string;
  file_number?: string;
  current_location?: string;
  assigned_user_id?: string | null;
  assigned_user_name?: string | null;
  default_documents?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface FileRequest {
  id: string;
  employee_id: string;
  file_id: string;
  document_type: string;
  requested_by_user_id: string;
  requested_by_name?: string;
  requested_by_department?: string;
  remarks?: string;
  status?: string;
  created_at?: string;
}

export interface FileMovement {
  id: string;
  employee_id: string;
  file_id: string;
  by_user_id: string;
  by_user_name?: string;
  from_location?: string;
  to_location?: string;
  to_assignee_user_id?: string;
  to_assignee_name?: string;
  action?: string;
  remarks?: string;
  timestamp?: string;
}

export interface ActionResponse {
  message: string;
}

export const employeeFileApi = createApi({
  reducerPath: 'employeeFileApi',
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ['employeeFiles', 'fileRequests', 'fileMovements'],
  endpoints: (builder) => ({
    // Employee files
    getAllEmployeeFiles: builder.query<EmployeeFile[], void>({
      query: () => {
        const token = JSON.parse(localStorage.getItem('token') || 'null');
        return { url: '/employee_files', method: 'GET', headers: { Authorization: `Bearer ${token}` } };
      },
      providesTags: ['employeeFiles'],
    }),

    getFileByEmployee: builder.query<EmployeeFile | null, string>({
      query: (employeeId: string) => {
        const token = JSON.parse(localStorage.getItem('token') || 'null');
        return { url: `/employee_files/${employeeId}`, method: 'GET', headers: { Authorization: `Bearer ${token}` } };
      },
      providesTags: ['employeeFiles'],
    }),

    createEmployeeFile: builder.mutation<EmployeeFile, { employee_id: string; file_number?: string; default_documents?: string[] }>({
      query: (body) => {
        const token = JSON.parse(localStorage.getItem('token') || 'null');
        return { url: '/employee_files', method: 'POST', body, headers: { Authorization: `Bearer ${token}` } };
      },
      invalidatesTags: ['employeeFiles'],
    }),

    updateEmployeeFile: builder.mutation<EmployeeFile, { id: string; employee_id: string; file_number?: string; default_documents?: string[] }>({
      query: (payload) => {
        const { id, ...body } = payload;
        const token = JSON.parse(localStorage.getItem('token') || 'null');
        return { url: `/employee_files/${id}`, method: 'PUT', body, headers: { Authorization: `Bearer ${token}` } };
      },
      invalidatesTags: ['employeeFiles'],
    }),

    // File requests
    requestFile: builder.mutation<FileRequest, { employee_id: string; file_id: string; document_type: string; requested_by_user_id: string; requested_by_name?: string; requested_by_department?: string; remarks?: string }>({
      query: (body) => {
        console.log("body>>>>>",body);
        
        const token = JSON.parse(localStorage.getItem('token') || 'null');
        return { url: '/file_requests', method: 'POST', body, headers: { Authorization: `Bearer ${token}` } };
      },
      invalidatesTags: ['fileRequests'],
    }),

    getAllFileRequests: builder.query<FileRequest[], void>({
      query: () => {
        const token = JSON.parse(localStorage.getItem('token') || 'null');
        return { url: '/file_requests', method: 'GET', headers: { Authorization: `Bearer ${token}` } };
      },
      providesTags: ['fileRequests'],
    }),

    approveFileRequest: builder.mutation<ActionResponse, { requestId: string; registry_user_id: string; registry_user_name: string; to_location: string; to_assignee_user_id?: string; to_assignee_name?: string; remarks?: string }>({
      query: ({ requestId, ...body }) => {
        const token = JSON.parse(localStorage.getItem('token') || 'null');
        return { url: `/file_requests/${requestId}/approve`, method: 'PUT', body, headers: { Authorization: `Bearer ${token}` } };
      },
      invalidatesTags: ['fileRequests', 'fileMovements', 'employeeFiles'],
    }),

    rejectFileRequest: builder.mutation<ActionResponse, { requestId: string; remarks?: string }>({
      query: ({ requestId, ...body }) => {
        const token = JSON.parse(localStorage.getItem('token') || 'null');
        return { url: `/file_requests/${requestId}/reject`, method: 'PUT', body, headers: { Authorization: `Bearer ${token}` } };
      },
      invalidatesTags: ['fileRequests'],
    }),

    // File movements
    getFileMovements: builder.query<FileMovement[], string>({
      query: (employeeId: string) => {
        const token = JSON.parse(localStorage.getItem('token') || 'null');
        return { url: `/file_movements/${employeeId}`, method: 'GET', headers: { Authorization: `Bearer ${token}` } };
      },
      providesTags: ['fileMovements'],
    }),

    returnFileToRegistry: builder.mutation<ActionResponse, { fileId: string; by_user_id: string; by_user_name?: string; remarks?: string }>({
      query: ({ fileId, ...body }) => {
        const token = JSON.parse(localStorage.getItem('token') || 'null');
        return { url: `/file_movements/${fileId}/return`, method: 'POST', body, headers: { Authorization: `Bearer ${token}` } };
      },
      invalidatesTags: ['fileMovements', 'employeeFiles'],
    }),
  }),
});

export const {
  useGetAllEmployeeFilesQuery,
  useGetFileByEmployeeQuery,
  useCreateEmployeeFileMutation,
  useUpdateEmployeeFileMutation,
  useRequestFileMutation,
  useApproveFileRequestMutation,
  useGetAllFileRequestsQuery,
  useRejectFileRequestMutation,
  useGetFileMovementsQuery,
  useReturnFileToRegistryMutation,
} = employeeFileApi;

export default employeeFileApi;
