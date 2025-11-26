import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import API_BASE_URL from '@/lib/apiConfig';

export interface DocumentType {
  id: string;
  name: string;
  employee_count: number;
  created_by?: string | null;
  updated_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export const documentTypeApi = createApi({
  reducerPath: 'documentTypeApi',
  baseQuery: fetchBaseQuery({ baseUrl: `${API_BASE_URL}/api/document_types` }),
  tagTypes: ['DocumentTypes'],
  endpoints: (build) => ({
    getAllDocumentTypes: build.query<DocumentType[], void>({
      query: () => '/',
      providesTags: ['DocumentTypes'],
    }),

    getDocumentTypeById: build.query<DocumentType, string>({
      query: (id) => `/${id}`,
      providesTags: ['DocumentTypes'],
    }),

    createDocumentType: build.mutation<DocumentType, { name: string; created_by?: string | null }>({
      query: (body) => ({
        url: '/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['DocumentTypes'],
    }),

    updateDocumentType: build.mutation<DocumentType, { id: string; name?: string; updated_by?: string | null }>({
      query: ({ id, ...body }) => ({
        url: `/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['DocumentTypes'],
    }),

    deleteDocumentType: build.mutation<{ success: boolean; id: string }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['DocumentTypes'],
    }),
  }),
});

export const {
  useGetAllDocumentTypesQuery,
  useGetDocumentTypeByIdQuery,
  useCreateDocumentTypeMutation,
  useUpdateDocumentTypeMutation,
  useDeleteDocumentTypeMutation,
} = documentTypeApi;

export default documentTypeApi;
