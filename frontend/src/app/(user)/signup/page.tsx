"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import axios, { AxiosError } from "axios"
import { axiosInstance } from "@/lib/api"

export default function Page() {
    const router = useRouter()
    const id = crypto.randomUUID()

    const [username, setUsername] = useState(id)
    const [email, setEmail] = useState(`${id}@gmail.com`)
    const [password, setPassword] = useState("12345678")
    const [showPassword, setShowPassword] = useState(true)
    const [loading, setLoading] = useState(false)

    const [errors, setErrors] = useState({
        username: "",
        email: "",
        password: "",
    })

    function validate() {
        const newErrors = { username: "", email: "", password: "" }

        const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/
        // const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/

        if (!username) newErrors.username = "Username is required"
        // else if (!usernameRegex.test(username))
        //     newErrors.username = "3–20 chars, letters, numbers, _ only"

        if (!email) newErrors.email = "Email is required"
        else if (!emailRegex.test(email)) newErrors.email = "Enter a valid email"

        if (!password) newErrors.password = "Password is required"
        else if (password.length < 8)
            newErrors.password = "Password must be at least 8 characters"

        setErrors(newErrors)
        return !newErrors.username && !newErrors.email && !newErrors.password
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!validate()) return

        setLoading(true)

        try {
            const { data } = await axiosInstance.post('/users/register', {
                email,
                username,
                password
            })
            if (data.success) {
                await axiosInstance.post('/users/login', {
                    identifier: email,
                    password: password
                }).then(() => router.push("/dashboard"))
            }
        } catch (error) {
            const err = error as AxiosError<any>
            // console.error(err)
            setErrors((prev) => ({ ...prev, password: err.response?.data.message || err.message || "unknown error" }))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="grid h-full place-items-center">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Create account</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                        Sign up to get started
                    </p>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="username" className="flex items-center gap-2">
                                <User size={16} /> Username
                            </Label>
                            <Input
                                id="username"
                                placeholder="yourname"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="mt-2"
                            />
                            {errors.username && (
                                <p className="text-xs text-red-600 mt-1">{errors.username}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="email" className="flex items-center gap-2">
                                <Mail size={16} /> Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-2"
                            />
                            {errors.email && (
                                <p className="text-xs text-red-600 mt-1">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="password" className="flex items-center gap-2">
                                <Lock size={16} /> Password
                            </Label>
                            <div className="relative mt-2">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Create a password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((s) => !s)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-xs text-red-600 mt-1">{errors.password}</p>
                            )}
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Creating account..." : "Sign up"}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="justify-center text-sm text-muted-foreground">
                    <span>Already have an account? </span>
                    <a href="/signin" className="ml-1 font-medium hover:underline">
                        Sign in
                    </a>
                </CardFooter>
            </Card>
        </div>
    )
}