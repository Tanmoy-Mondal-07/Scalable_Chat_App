"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Search, MessageSquare, Users, Circle } from "lucide-react"
import { axiosInstance } from "@/lib/api"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { useAuthStore } from "@/lib/authStore"

export function AppSidebar() {
  const user = useAuthStore((state) => state.user);

  const [userList, setUserList] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axiosInstance.post('/users/getallusers')
        // console.log(data.data[0]);
        setUserList(data.data)
      } catch (error) {
        console.error("Failed to fetch users:", error)
      } finally {
        setIsLoading(false)
      }
    })()
  }, [user])

  const filteredUsers = userList.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!user) return;

  return (
    <Sidebar className="border-r border-border/50 bg-sidebar/50 backdrop-blur-xl">
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="text-xl font-bold tracking-tight text-foreground/90">Messages</h2>
          <MessageSquare className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search connections..."
            className="pl-9 bg-background/50 border-none ring-1 ring-border focus-visible:ring-primary/50 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
            Recent Chats
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {isLoading ? (
                <div className="p-4 text-sm text-muted-foreground animate-pulse">Loading users...</div>
              ) : (
                filteredUsers.map((user) => (
                  <SidebarMenuItem key={user.id}>
                    <SidebarMenuButton
                      asChild
                      className="h-14 px-4 rounded-xl hover:bg-accent/50 transition-all duration-200 group"
                    >
                      <Link href={`/message/${user.id}`} className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10 border-2 border-background shadow-sm group-hover:scale-105 transition-transform">
                            <AvatarImage src={user.avatar_url} alt={user.username} />
                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                              {user.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {/* Online Indicator Mockup */}
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-background rounded-full" />
                        </div>

                        <div className="flex flex-col items-start overflow-hidden">
                          <span className="font-semibold text-sm text-foreground/90 truncate w-full">
                            {user.username}
                          </span>
                          <span className="text-xs text-muted-foreground truncate w-full">
                            Click to send a message
                          </span>
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Suggested Section */}
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="flex items-center gap-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
            <Users className="w-3 h-3" /> Suggested
          </SidebarGroupLabel>
          <SidebarMenu className="gap-1">
            {/* Map through a smaller subset or different list here */}
            {userList.slice(0, 10).map((user) => (
              <SidebarMenuItem key={`suggested-${user.id}`}>
                <SidebarMenuButton className="h-12 rounded-xl opacity-70 hover:opacity-100 transition-opacity">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{user.username}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}