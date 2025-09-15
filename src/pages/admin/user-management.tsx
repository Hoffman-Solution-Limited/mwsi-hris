import React from "react"
import { Layout } from "@/components/Layout"
import { UserManagementPage } from "@/features/admin/UserManagementPage"

const UserManagement: React.FC = () => (
  <Layout>
    <UserManagementPage />
  </Layout>
)

export default UserManagement
