"use client"

import { useEffect, useState } from "react";
import {
  Search,
  Menu,
  X,
  Settings,
  LogOut,
  Sun,
  Moon,
  User,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes"
import { SidebarTrigger } from "./ui/sidebar";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { axiosInstance } from "@/lib/api";

export default function TopNavbar() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false);
  const { setTheme, resolvedTheme, systemTheme } = useTheme()

  function setTheam() {
    if (resolvedTheme === "dark") {
      setTheme("light");
    } else if (resolvedTheme === "light") {
      setTheme("dark");
    }
  }

  async function logoutuser() {
    // setLoading(true)
    try {
      const { data } = await axiosInstance.post('/users/logout')
      if (data.success) router.push("/")
    } catch (error) {
      const err = error as AxiosError<any>
      console.error(err)
      // setErrors((prev) => ({ ...prev, password: err.response?.data.message || err.message || "unknown error" }))
    } finally {
      // setLoading(false)
    }
  }

  const navItems = [
    { name: "SignIn", href: "/signin" },
    { name: "SignUp", href: "/signup" },
    { name: "Orders", href: "/orders" },
    { name: "Analytics", href: "/analytics" },
  ];

  // Mock User Data
  const user = {
    name: "Jane Doe",
    email: "jane@photography.com",
    role: "Admin",
    avatarUrl: ""
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* LEFT: Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <SidebarTrigger />
          </div>

          {/* CENTER: Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-2 md:gap-4">

            {/* Search Bar (Desktop) */}
            <div className="hidden md:flex relative w-64 items-center">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-9 h-9 bg-muted/50 border-none focus-visible:ring-1"
              />
            </div>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={setTheam}
            >

              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />

              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />

              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Notifications */}
            {/* <Button variant="ghost" size="icon" className="h-9 w-9 relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />
              <span className="sr-only">Notifications</span>
            </Button> */}

            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-transparent hover:ring-border transition-all">
                  <Avatar className="h-9 w-9 border border-border">
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      {/* Role Badge */}
                      <Badge variant="secondary" className="text-[10px] h-5 px-1.5 uppercase tracking-wider">
                        {user.role}
                      </Badge>
                    </div>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logoutuser} className="text-red-500 focus:text-red-500 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {isOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur animate-in slide-in-from-top-5 fade-in duration-200">
          <div className="p-4 space-y-4">
            {/* Mobile Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-9 bg-muted/50"
              />
            </div>

            {/* Mobile Links */}
            <div className="grid gap-2">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  {item.name}
                </a>
              ))}
            </div>

            {/* Mobile User Section (redundancy for better UX on mobile) */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-3 px-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatarUrl} />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{user.name}</span>
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}