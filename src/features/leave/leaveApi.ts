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
        const isAdmin = user.role==="admin";
        
        return {
          url: `/leaves`,
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
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
    getAllLeaveTypes: builder.query({
      query: () => {
        const user = JSON.parse(localStorage.getItem("loggedInUser"));
        const token = JSON.parse(localStorage.getItem("token"));
        const isAdmin = user.role==="admin";
        
        return {
          url: `/leave_types`,
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
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
  }),
});

export const {
useGetAllLeavesQuery,
useApplyLeaveMutation,
useGetAllLeaveTypesQuery,
useCreateLeaveTypeMutation
} = leaveApi;
