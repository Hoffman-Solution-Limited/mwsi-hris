import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '@/lib/apiConfig';

export interface DocumentType {
  id: string;
  name: string;
  created_by?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type DocumentTypeCreatePayload = Pick<DocumentType, 'name' | 'created_by' | 'isActive'>;
export type DocumentTypeUpdatePayload = Partial<DocumentTypeCreatePayload> & { id: string, updated_by: string | null };

export const documentTypeApi = createApi({
  reducerPath: 'documentTypeApi',
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ['DocumentType'],
  endpoints: (build) => ({
    getAllDocumentTypes: build.query<DocumentType[], void>({
      query: () => (
        { url: '/document_types', 
            method: 'GET' 
        }
    ),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'DocumentType' as const, id })), { type: 'DocumentType', id: 'LIST' }]
          : [{ type: 'DocumentType', id: 'LIST' }],
    }),

    getDocumentTypeById: build.query<DocumentType, string>({
      query: (id) => (
        { 
            url: `/document_types/${id}`, 
            method: 'GET'
        }
      ),
      providesTags: (result, error, id) => [{ type: 'DocumentType', id }],
    }),

    createDocumentType: build.mutation<DocumentType, DocumentTypeCreatePayload>({
      query: (payload) => (
        { 
            url: '/document_types', 
            method: 'POST', 
            body: payload 
        }
      ),
      invalidatesTags: [{ type: 'DocumentType', id: 'LIST' }],
    }),

    updateDocumentType: build.mutation<DocumentType, DocumentTypeUpdatePayload>({
      query: ({ id, ...patch }) => (
        { 
            url: `/document_types/${id}`, 
            method: 'PUT',
            body: patch 
        }
      ),
      invalidatesTags: (result, error, { id }) => [{ type: 'DocumentType', id }, { type: 'DocumentType', id: 'LIST' }],
    }),

    deleteDocumentType: build.mutation<{ success: boolean; id: string }, string>({
      query: (id) => (
        { 
            url: `/document_types/${id}`, 
            method: 'DELETE' 
        }
      ),
      invalidatesTags: (result, error, id) => [{ type: 'DocumentType', id }, { type: 'DocumentType', id: 'LIST' }],
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
