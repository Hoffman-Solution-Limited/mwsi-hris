import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import API_BASE_URL from '@/lib/apiConfig';

export interface EmployeeDocument {
  id: string;
  document_type_id: string;
  document_name: string;
  file_url?: string | null;
  file_type?: string | null;
  is_verified: boolean;
  uploaded_by_name?: string | null;
  uploaded_at?: string | null;
  verified_by?: string | null;
  verified_at?: string | null;
}

export interface EmployeeFile {
  id: string;
  employee_id: string;
  file_number: string;
  current_location: string;
  documents: EmployeeDocument[]; // ✅ Typed array
  assigned_user_id?: string | null;
  assigned_user_name?: string | null;
  status: string;
  created_at?: string;
  updated_at?: string;
}


export const employeeFileApi = createApi({
  reducerPath: 'employeeFileApi',
  baseQuery: fetchBaseQuery({ baseUrl: `${API_BASE_URL}/employee_files` }),
  tagTypes: ['EmployeeFiles'],
  endpoints: (build) => ({
    getAllEmployeeFiles: build.query<EmployeeFile[], void>({
      query: () => '/',
      providesTags: ['EmployeeFiles'],
    }),

    getFileByEmployee: build.query<EmployeeFile, string>({
      query: (employeeId) => `/${employeeId}`,
      providesTags: ['EmployeeFiles'],
    }),

    createEmployeeFile: build.mutation<EmployeeFile, { employee_id: string; file_number: string }>({
      query: (body) => ({
        url: '/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['EmployeeFiles'],
    }),

    updateEmployeeFile: build.mutation<EmployeeFile, { id: string; current_location?: string; assigned_user_id?: string; assigned_user_name?: string; status?: string }>({
      query: ({ id, ...body }) => ({
        url: `/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['EmployeeFiles'],
    }),
  }),
});

export const {
  useGetAllEmployeeFilesQuery,
  useGetFileByEmployeeQuery,
  useCreateEmployeeFileMutation,
  useUpdateEmployeeFileMutation,
} = employeeFileApi;

export default employeeFileApi;
