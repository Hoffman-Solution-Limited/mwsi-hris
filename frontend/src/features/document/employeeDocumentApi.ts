import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import API_BASE_URL from "@/lib/apiConfig";

export interface EmployeeDocument {
  id: string;
  employee_id: string;
  document_type_id: string;
  document_name: string;
  file_url?: string;
  file_type?: string;
  uploaded_by_user_id?: string;
  uploaded_by_name?: string;
  uploaded_at?: string;
  created_at?: string;
  updated_at?: string;
  is_verified?: boolean;
  verified_by?: string;
  verified_at?: string;
}

export interface UploadEmployeeDocumentRequest {
  document_id: string;
  file: File;
  employee_id: string;
  document_type_id: string;
  uploaded_by_user_id: string;
  uploaded_by_name: string;
}

export interface UpdateEmployeeDocumentRequest {
  id: string;
  document_name?: string;
  document_type_id?: string;
  is_verified?: boolean;
  verified_by?: string;
}

// --- API ---
export const employeeDocumentApi = createApi({
  reducerPath: "employeeDocumentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/employee_documents`,
  }),
  tagTypes: ["EmployeeDocuments"],

  endpoints: (build) => ({
    // --- Upload Document (Cloudinary) ---
    uploadEmployeeDocument: build.mutation<EmployeeDocument, UploadEmployeeDocumentRequest>({
      query: ({ document_id, file, ...body }) => {
        const formData = new FormData();
        formData.append("file", file);
        Object.entries(body).forEach(([key, value]) => {
          formData.append(key, value as string);
        });

        return {
          url: `/${document_id}/upload`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["EmployeeDocuments"],
    }),

    // --- Get All Employee Documents ---
    getAllEmployeeDocuments: build.query<EmployeeDocument[], void>({
      query: () => "/",
      providesTags: ["EmployeeDocuments"],
    }),

    // --- Get Documents by Employee ID ---
    getEmployeeDocumentsByEmployeeId: build.query<EmployeeDocument[], string>({
      query: (employeeId) => `/employee/${employeeId}`,
      providesTags: ["EmployeeDocuments"],
    }),

    // --- Get Single Document ---
    getSingleEmployeeDocument: build.query<EmployeeDocument, string>({
      query: (id) => `/${id}`,
      providesTags: ["EmployeeDocuments"],
    }),

    // --- Update Employee Document ---
    updateEmployeeDocument: build.mutation<EmployeeDocument, UpdateEmployeeDocumentRequest>({
      query: ({ id, ...body }) => ({
        url: `/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["EmployeeDocuments"],
    }),

    // --- Delete Employee Document ---
    deleteEmployeeDocument: build.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["EmployeeDocuments"],
    }),
  }),
});

// --- Hooks ---
export const {
  useUploadEmployeeDocumentMutation,
  useGetAllEmployeeDocumentsQuery,
  useGetEmployeeDocumentsByEmployeeIdQuery,
  useGetSingleEmployeeDocumentQuery,
  useUpdateEmployeeDocumentMutation,
  useDeleteEmployeeDocumentMutation,
} = employeeDocumentApi;
