"use client";

import { useEffect, useState, useRef } from "react";
import { Search, Menu, X, Settings, LogOut, Sun, Moon, User, MessageSquare, Loader2, } from "lucide-react";
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
import { useTheme } from "next-themes";
import { SidebarTrigger } from "./ui/sidebar";
import { useRouter } from "next/navigation";
import { axiosInstance } from "@/lib/api";
import axios from "axios";
import { useAuthStore } from "@/lib/authStore";
import Link from "next/link";

export default function TopNavbar() {
  const logedInUser = useAuthStore((state) => state.user);
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function syncAuth() {
      try {
        const response = await axios.post(
          process.env.NEXT_PUBLIC_BACKEND_API ? `${process.env.NEXT_PUBLIC_BACKEND_API}/api/v1/users/getcurrentuser` : "/api/v1/users/getcurrentuser",
          {},
          { withCredentials: true }
        )
        useAuthStore.getState().setUser(response.data.data.user)
      } catch {
        useAuthStore.getState().clearUser()
      }
    }

    syncAuth()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  async function performSearch(query: string) {
    setIsSearching(true);
    setShowResults(true);
    try {
      const { data } = await axiosInstance.post("/users/searchusers", {
        username: query,
      });
      // console.log(data);
      setSearchResults(data.data || []);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setIsSearching(false);
    }
  }

  function toggleTheme() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }

  async function logoutuser() {
    try {
      const { data } = await axiosInstance.post("/users/logout");
      useAuthStore.getState().clearUser();
      if (data.success) router.push("/signin");
    } catch (error) {
      console.error("Logout failed", error);
    }
  }

  const navItems = [
    { name: "SignIn", href: "/signin" },
    { name: "SignUp", href: "/signup" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* LEFT: Logo/Sidebar */}
          {!!logedInUser && <div className="flex items-center gap-2 shrink-0">
            <div className="bg-primary/10 p-1.5 rounded-lg">
              <SidebarTrigger className="h-5 w-5" />
            </div>
          </div>}

          {/* CENTER: Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full transition-all"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-2 md:gap-4 flex-1 justify-end">

            {/* SEARCH AREA */}
            <div className="relative hidden md:flex w-full max-w-[300px]" ref={searchRef}>
              <div className="relative w-full group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type="search"
                  placeholder="Search creators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowResults(true)}
                  className="pl-10 h-10 bg-muted/40 border-none ring-1 ring-border/50 focus-visible:ring-2 focus-visible:ring-primary/50 transition-all rounded-xl"
                />
              </div>

              {/* SEARCH RESULTS DROIR */}
              {showResults && (searchQuery || isSearching) && (
                <div className="absolute top-full left-0 mt-2 w-full bg-popover border border-border shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-2 max-h-[400px] overflow-y-auto">
                    {isSearching ? (
                      <div className="flex items-center justify-center py-8 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        <span className="text-sm">Searching...</span>
                      </div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((user: any) => (
                        <Link
                          href={`/message/${user.id}`}
                          key={user.id}
                          className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-xl transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border border-border">
                              <AvatarImage src={user.avatar_url} />
                              <AvatarFallback className="text-xs uppercase">
                                {user.username.substring(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold">{user.username}</span>
                              {/* <span className="text-[10px] text-muted-foreground lowercase">@{user.username}</span> */}
                            </div>
                          </div>
                          {/* <Link href={`/message/${user.id}`} className="h-8 w-8 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                            <MessageSquare className="h-4 w-4" />
                          </Link> */}
                        </Link>
                      ))
                    ) : (
                      <div className="py-8 text-center text-sm text-muted-foreground">
                        No users found for "{searchQuery}"
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-xl hover:bg-primary/5 transition-colors"
              onClick={toggleTheme}
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {/* User Profile */}
            {!!logedInUser && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden ring-2 ring-transparent hover:ring-primary/20 transition-all">
                    <Avatar className="h-10 w-10">
                      {logedInUser.avatar_url ? (
                        <AvatarImage src={logedInUser.avatar_url} />
                      ) : (
                        <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xs">
                          {logedInUser.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 mt-2 p-2 rounded-2xl shadow-xl border-border/50" align="end">
                  <DropdownMenuLabel className="p-3">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-bold leading-none">{logedInUser.username}</p>
                      <p className="text-xs text-muted-foreground">{logedInUser.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="opacity-50" />
                  <DropdownMenuGroup className="p-1">
                    <DropdownMenuItem className="rounded-lg cursor-pointer py-2">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg cursor-pointer py-2">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="opacity-50" />
                  <DropdownMenuItem onClick={logoutuser} className="rounded-lg text-destructive focus:text-destructive cursor-pointer py-2">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-10 w-10 rounded-xl"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {isOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur-lg animate-in slide-in-from-top-2 duration-300">
          <div className="p-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-10 bg-muted/50 rounded-xl border-none h-11"
              />
            </div>

            <div className="space-y-1">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex items-center px-4 py-3 text-sm font-semibold rounded-xl hover:bg-primary/5 transition-colors"
                >
                  {item.name}
                </a>
              ))}
            </div>

            {!!logedInUser && (
              <div className="pt-4 border-t flex items-center gap-3 px-2">
                <Avatar className="h-10 w-10 border border-border">
                  {logedInUser.avatar_url ? <AvatarImage src={logedInUser.avatar_url} />
                    : <AvatarFallback>{logedInUser.username.substring(0, 2)}</AvatarFallback>}
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-bold">{logedInUser.username}</span>
                  <span className="text-xs text-muted-foreground">My Account</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}