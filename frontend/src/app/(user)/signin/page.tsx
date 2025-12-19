"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Mail, Lock, Eye, EyeOff } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { AxiosError } from 'axios'
import { axiosInstance } from "@/lib/api"
import { useAuthStore } from "@/lib/authStore"
// import { Checkbox } from "@/components/ui/checkbox"

export default function Page() {
  const setUser = useAuthStore.getState().setUser;
  const router = useRouter()
  const [email, setEmail] = useState("a@gmail.com")
  const [password, setPassword] = useState("12345678")
  const [showPassword, setShowPassword] = useState(true)
  const [errors, setErrors] = useState({ email: "", password: "" })
  const [loading, setLoading] = useState(false)

  function validate() {
    const newErrors: any = { email: "", password: "" }
    // const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/
    if (!email) newErrors.email = "Email is required"
    // else if (!emailRegex.test(email)) newErrors.email = "Enter a valid email"

    if (!password) newErrors.password = "Password is required"
    else if (password.length < 8) newErrors.password = "Password must be at least 8 characters"

    setErrors(newErrors)

    return !newErrors.email && !newErrors.password
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const { data } = await axiosInstance.post('/users/login', {
        identifier: email,
        password: password
      }, { withCredentials: true, })
      setUser(data.data.user)
      if (data.success) router.push("/")
    } catch (error) {
      const err = error as AxiosError<any>
      // console.error(err)
      setErrors((prev) => ({ ...prev, password: err.response?.data.message || err.message || "unknown error" }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="p-6 text-center">
          <CardTitle className="text-2xl font-semibold">Sign in</CardTitle>
          <p className="text-sm text-slate-500 mt-1">Welcome back — enter your details to continue</p>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail size={16} />
                <span className="text-xs">Email or Username</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2"
              />
              {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock size={16} />
                <span className="text-xs">Password</span>
              </Label>

              <div className="relative mt-2">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between">
              {/* <div className="flex items-center gap-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember" className="text-sm">Remember me</Label>
              </div> */}

              <a href="forgotpassword" className="text-sm text-slate-600 hover:underline">Forgot password?</a>
            </div>

            <div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </div>
          </form>
        </CardContent>

        <CardFooter className="p-6">
          <div className="w-full text-center text-sm text-slate-600">
            <span>Don't have an account? </span>
            <a href="signup" className="font-medium hover:underline">Create account</a>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}