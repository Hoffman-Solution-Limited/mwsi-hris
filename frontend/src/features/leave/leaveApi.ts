import API_BASE_URL from '@/lib/apiConfig';

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const leaveApi = createApi({
  reducerPath: "leaveApi",
  baseQuery: fetchBaseQuery({ baseUrl: "https://tart-minette-izotech2-fcbe6611.koyeb.app/api" }),
  tagTypes: ["leaves", "leaveTypes"],
  endpoints: (builder) => ({

    // =========================
    // 🟢 LEAVE REQUESTS
    // =========================
    getAllLeaves: builder.query({
      query: () => {
        const token = JSON.parse(localStorage.getItem("token"));
        return {
          url: `/leaves`,
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        };
      },
      providesTags: ["leaves"],
    }),

    getLeaveById: builder.query({
      query: (leaveId: string) => {
        const token = JSON.parse(localStorage.getItem("token"));
        return {
          url: `/leaves/${leaveId}`,
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        };
      },
      providesTags: ["leaves"],
    }),

    applyLeave: builder.mutation({
      query: (newLeave) => {
        const token = JSON.parse(localStorage.getItem("token"));
        return {
          url: `/leaves`,
          method: "POST",
          body: newLeave,
          headers: { Authorization: `Bearer ${token}` },
        };
      },
      invalidatesTags: ["leaves"],
    }),

    updateLeave: builder.mutation({
      query: (updateDetail) => {
        const token = JSON.parse(localStorage.getItem("token"));
        return {
          url: `/leaves/${updateDetail.id}`,
          method: "PUT",
          body: updateDetail,
          headers: { Authorization: `Bearer ${token}` },
        };
      },
      invalidatesTags: ["leaves"],
    }),

    deleteLeave: builder.mutation({
      query: (leaveId: string) => {
        const token = JSON.parse(localStorage.getItem("token"));
        return {
          url: `/leaves/${leaveId}`,
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        };
      },
      invalidatesTags: ["leaves"],
    }),

    getEmployeeLeavesAndBalance: builder.query({
      query: (employeeId: string) => {
        const token = JSON.parse(localStorage.getItem("token"));
        return {
          url: `/leaves/balance/${employeeId}`,
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        };
      },
      providesTags: ["leaves"],
    }),

    getAllLeaveBalance: builder.query({
      query: (employeeId: string) => {
        const token = JSON.parse(localStorage.getItem("token"));
        return {
          url: `/leaves/balances`,
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        };
      },
      providesTags: ["leaves"],
    }),

    getUsedLeaveDays: builder.query({
      query: (employeeId: string) => {
        const token = JSON.parse(localStorage.getItem("token"));
        return {
          url: `/leaves/used/${employeeId}`,
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        };
      },
      providesTags: ["leaves"],
    }),

    // =========================
    // 🟡 MANAGER APPROVALS
    // =========================
    getPendingApprovalsForManager: builder.query({
      query: (managerId: string) => {
        const token = JSON.parse(localStorage.getItem("token"));
        return {
          url: `/leaves/manager/${managerId}/pending`,
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        };
      },
      providesTags: ["leaves"],
    }),

    managerApproveLeave: builder.mutation({
      query: ({ leaveId, manager_id }) => {
        const token = JSON.parse(localStorage.getItem("token"));
        return {
          url: `/leaves/${leaveId}/manager/approve`,
          method: "PATCH",
          body: { manager_id },
          headers: { Authorization: `Bearer ${token}` },
        };
      },
      invalidatesTags: ["leaves"],
    }),

    managerRejectLeave: builder.mutation({
      query: ({ leaveId, manager_id }: { leaveId: string; manager_id: string }) => {
        const token = JSON.parse(localStorage.getItem("token"));
        return {
          url: `/leaves/${leaveId}/manager/reject`,
          method: "PATCH",
          body: { manager_id },
          headers: { Authorization: `Bearer ${token}` },
        };
      },
      invalidatesTags: ["leaves"],
    }),

    getPendingApprovalsForHR: builder.query({
      query: () => {
        const token = JSON.parse(localStorage.getItem("token"));
        return {
          url: `/leaves/hr/pending`,
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        };
      },
      providesTags: ["leaves"],
    }),

    approveLeave: builder.mutation({
      query: ({ leaveId, approvalData }: { leaveId: string; approvalData: any }) => {
        const token = JSON.parse(localStorage.getItem("token"));
        return {
          url: `/leaves/${leaveId}/hr/approve`,
          method: "PATCH",
          body: approvalData,
          headers: { Authorization: `Bearer ${token}` },
        };
      },
      invalidatesTags: ["leaves"],
    }),

    rejectLeave: builder.mutation({
      query: ({ leaveId, rejectData }: { leaveId: string; rejectData?: any }) => {
        const token = JSON.parse(localStorage.getItem("token"));
        return {
          url: `/leaves/${leaveId}/hr/reject`,
          method: "PATCH",
          body: rejectData,
          headers: { Authorization: `Bearer ${token}` },
        };
      },
      invalidatesTags: ["leaves"],
    }),

    // =========================
    // 🟤 LEAVE TYPES
    // =========================
    getAllLeaveTypes: builder.query({
      query: () => {
        const token = JSON.parse(localStorage.getItem("token"));
        return {
          url: `/leave_types`,
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        };
      },
      providesTags: ["leaveTypes"],
    }),

    createLeaveType: builder.mutation({
      query: (newLeaveType) => {
        const token = JSON.parse(localStorage.getItem("token"));
        return {
          url: `/leave_types`,
          method: "POST",
          body: newLeaveType,
          headers: { Authorization: `Bearer ${token}` },
        };
      },
      invalidatesTags: ["leaveTypes"],
    }),

  }),
});

export const {
  // Leaves
  useGetAllLeavesQuery,
  useGetLeaveByIdQuery,
  useApplyLeaveMutation,
  useUpdateLeaveMutation,
  useDeleteLeaveMutation,
  useGetEmployeeLeavesAndBalanceQuery,
  useGetAllLeaveBalanceQuery,
  useGetUsedLeaveDaysQuery,

  // Manager & HR
  useGetPendingApprovalsForManagerQuery,
  useManagerApproveLeaveMutation,
  useManagerRejectLeaveMutation,
  useGetPendingApprovalsForHRQuery,
  useApproveLeaveMutation,
  useRejectLeaveMutation,

  // Leave Types
  useGetAllLeaveTypesQuery,
  useCreateLeaveTypeMutation,
} = leaveApi;
