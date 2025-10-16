import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const apiBaseUrl='http://localhost:5000/api'

export const leaveApi = createApi({
  reducerPath: "leaveApi",
  baseQuery: fetchBaseQuery({ baseUrl: `${apiBaseUrl}` }),
  tagTypes: ["leaves"],
  endpoints: (builder) => ({
    getAllLeaves: builder.query({
      query: () => {
        const user = JSON.parse(localStorage.getItem("loggedInUser"));
        const token = JSON.parse(localStorage.getItem("token"));
        // const isAdmin = user.role==="admin";
        
        return {
          url: `/leaves`,
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          },
        };
      },
      providesTags: ["leaves"],
    }),

    applyLeave: builder.mutation({
      query: (newLeave) => {
        return {
          url: "/leaves",
          method: "POST",
          body: newLeave
        };
      },
      invalidatesTags: ["leaves"],
    }),
    
    updateLeave: builder.mutation({
      query: (updateDetail) => {
        const token = JSON.parse(localStorage.getItem("token"));
        const user = JSON.parse(localStorage.getItem("loggedInUser"));
        // const isManage = user.role === "admin" || user.role === "staff";
        return {
          url: `/leaves/${updateDetail.id}`,
          method: "PUT",
          body: updateDetail,
          headers: {
            Authorization: `Bearer ${token}`
          },
        };
      },
      invalidatesTags: ["leaves"],
    }),
    getAllLeaveTypes: builder.query({
      query: () => {
        const user = JSON.parse(localStorage.getItem("loggedInUser"));
        const token = JSON.parse(localStorage.getItem("token"));
        // const isAdmin = user.role==="admin";
        
        return {
          url: `/leave_types`,
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          },
        };
      },
      providesTags: ["leaves"],
    }),

    createLeaveType: builder.mutation({
      query: (newLeaveType) => {
        return {
          url: "/leaves",
          method: "POST",
          body: newLeaveType
        };
      },
      invalidatesTags: ["leaves"],
    }),

    managerApproveLeave: builder.mutation({
      query: ({ leaveId, manager_id }: { leaveId: string; manager_id: string }) => {
        const token = JSON.parse(localStorage.getItem("token"));
        return {
          url: `/leaves/${leaveId}/manager/approve`,
          method: "PATCH",
          body: { manager_id },
          headers: {
            Authorization: `Bearer ${token}`
          },
        };
      },
      invalidatesTags: ["leaves"],
    }),

    approveLeave: builder.mutation({
      query: ({ leaveId, approvalData }: { leaveId: string; approvalData: any }) => {
        const token = JSON.parse(localStorage.getItem("token"));
        return {
          url: `/leaves/${leaveId}/approve`,
          method: "PATCH",
          body: approvalData,
          headers: {
            Authorization: `Bearer ${token}`
          },
        };
      },
      invalidatesTags: ["leaves"],
    }),

    rejectLeave: builder.mutation({
      query: ({ leaveId, rejectData }: { leaveId: string; rejectData?: any }) => {
        const token = JSON.parse(localStorage.getItem("token"));
        return {
          url: `/leaves/${leaveId}/reject`,
          method: "PATCH",
          body: rejectData,
          headers: {
            Authorization: `Bearer ${token}`
          },
        };
      },
      invalidatesTags: ["leaves"],
    }),
    getLeaveById: builder.query({
      query: (leaveId) => {
        const user = JSON.parse(localStorage.getItem("loggedInUser"));
        const token = JSON.parse(localStorage.getItem("token"));
        // const isAdmin = user.role === "admin";

        return {
          url: `/leaves/${leaveId}`,
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          },
        };
      },
      providesTags: ["leaves"],
    }),
     getEmployeeLeavesAndBalance: builder.query({
      query: (employeeId) => {
        const user = JSON.parse(localStorage.getItem("loggedInUser"));
        const token = JSON.parse(localStorage.getItem("token"));
        // const isAdmin = user.role === "admin";

        return {
          url: `/leaves/myleave/${employeeId}`,
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          },
        };
      },
      providesTags: ["leaves"],
    }),

     deleteLeave: builder.mutation({
      query: (leaveId: string) => {
        const token = JSON.parse(localStorage.getItem("token"));
        return {
          url: `/leaves/${leaveId}`,
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          },
        };
      },
      invalidatesTags: ["leaves"],
    }),
    
  }),
});

export const {
useGetAllLeavesQuery,
useApplyLeaveMutation,
useGetAllLeaveTypesQuery,
useCreateLeaveTypeMutation,
useUpdateLeaveMutation,
useDeleteLeaveMutation,
useAssignLeaveToHrMutation,
useApproveLeaveMutation,
useRejectLeaveMutation,
useGetLeaveByIdQuery,
useGetEmployeeLeavesAndBalanceQuery
} = leaveApi;
