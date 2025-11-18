import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import API_BASE_URL from '@/lib/apiConfig';

export interface Employee {
  id: string;
  employeeNumber?: string;
  name: string;
  email?: string;
  position?: string;
  department?: string;
  manager?: string;
  managerId?: string;
  hireDate?: string;
  status?: 'active' | 'inactive' | 'terminated' | 'retired';
  avatar?: string;
  phone?: string;
  stationName?: string;
  skillLevel?: string;
  jobGroup?: string;
  engagementType?: string;
  ethnicity?: string;
  role?: string;
  nextOfKinName?: string;
  nextOfKinRelationship?: string;
  nextOfKinPhone?: string;
  nextOfKinEmail?: string;
  hasSpecialNeeds?: boolean;
  specialNeedsDescription?: string;
  homeSubcounty?: string;
  [key: string]: any;
}

// Payload Types
export interface CreateEmployeePayload extends Partial<Employee> {
  name: string;
}

export interface UpdateEmployeePayload extends Partial<Employee> {
  id: string;
}

// Employee API
export const employeeApi = createApi({
  reducerPath: 'employeeApi',
  baseQuery: fetchBaseQuery({ baseUrl: `${API_BASE_URL}/employees` }),
  tagTypes: ['Employees'],

  endpoints: (build) => ({
    // Get all employees
    getEmployees: build.query<Employee[], void>({
      query: () => `/`,
      providesTags: ['Employees'],
    }),

    // Get employee by ID
    getEmployeeById: build.query<Employee, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Employees', id }],
    }),

    // Create employee
    createEmployee: build.mutation<Employee, CreateEmployeePayload>({
      query: (body) => ({
        url: `/`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Employees'],
    }),

    // Update employee
    updateEmployee: build.mutation<Employee, UpdateEmployeePayload>({
      query: ({ id, ...body }) => ({
        url: `/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Employees', id },
        'Employees',
      ],
    }),

    // Delete employee
    deleteEmployee: build.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Employees'],
    }),
  }),
});

// Auto-generated React hooks
export const {
  useGetEmployeesQuery,
  useGetEmployeeByIdQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
} = employeeApi;
