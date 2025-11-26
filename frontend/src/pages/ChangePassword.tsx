import React from "react"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type FormValues = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

const ChangePassword: React.FC = () => {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting }, reset } = useForm<FormValues>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }
  })

  const newPwd = watch("newPassword")

  async function onSubmit(values: FormValues) {
    // TODO: integrate with backend password change endpoint
    // Example validation is handled on client; here we just simulate success
    await new Promise(r => setTimeout(r, 800))
    reset()
    // Optionally, show a toast here if you have a toast utility
    // toast({ title: "Password updated" })
  }

  return (
    <div className="mx-auto max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form id="change-password-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="Enter current password"
                disabled={isSubmitting}
                {...register("currentPassword", { required: "Current password is required" })}
              />
              {errors.currentPassword && (
                <p className="text-destructive text-sm">{errors.currentPassword.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="At least 8 characters"
                disabled={isSubmitting}
                {...register("newPassword", {
                  required: "New password is required",
                  minLength: { value: 8, message: "Must be at least 8 characters" },
                })}
              />
              {errors.newPassword && (
                <p className="text-destructive text-sm">{errors.newPassword.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter new password"
                disabled={isSubmitting}
                {...register("confirmPassword", {
                  required: "Please confirm the new password",
                  validate: (v) => v === newPwd || "Passwords do not match",
                })}
              />
              {errors.confirmPassword && (
                <p className="text-destructive text-sm">{errors.confirmPassword.message}</p>
              )}
            </div>
          </form>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button type="reset" variant="outline" disabled={isSubmitting} onClick={() => reset()}>Cancel</Button>
          <Button type="submit" form="change-password-form" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default ChangePassword
