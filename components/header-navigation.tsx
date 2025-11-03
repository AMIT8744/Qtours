"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { LogOut, LayoutDashboard, Calendar, MapPin, Users, Ship, Package, Menu, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { logout } from "@/app/actions/auth-actions"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import HeaderSearch from "./header-search"
import LanguageSelector from "./language-selector"
import { useTranslation } from "@/contexts/translation-context"

export default function HeaderNavigation({ user }: { user?: any }) {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState(user)
  const { t } = useTranslation()

  // Check if user is an agent to hide certain navigation items
  const isAgent = currentUser?.role === "agent"

  useEffect(() => {
    // Update current user when prop changes
    setCurrentUser(user)
  }, [user])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const navigationItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: t("navigation.dashboard", "Dashboard"), show: true },
    { href: "/dashboard/bookings", icon: Calendar, label: t("navigation.bookings", "Bookings"), show: true },
    { href: "/dashboard/tours", icon: MapPin, label: t("navigation.tours", "Tours"), show: !isAgent }, // Hide for agents
    { href: "/dashboard/packages", icon: Package, label: t("navigation.packages", "Packages"), show: !isAgent }, // Hide for agents
    { href: "/dashboard/agents", icon: Users, label: t("navigation.agents", "Agents"), show: !isAgent }, // Hide for agents
    { href: "/dashboard/ships", icon: Ship, label: t("navigation.ships", "Ships"), show: !isAgent }, // Hide for agents
  ]

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
        {/* Left Section - Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 text-sm sm:text-base md:text-lg font-semibold">
          <Image
            src="https://i.ibb.co/hR1V7jBX/image.png"
            alt="Viaggi Del Qatar Logo"
            width={32}
            height={32}
            className="object-contain"
          />
          <span className="text-[#6b0f1a] text-xs sm:text-sm md:text-base lg:text-lg">Viaggi Del Qatar</span>
        </Link>

        {/* Center Section - Search Bar (Hidden on very small screens) */}
        <div className="hidden sm:block">
          <HeaderSearch />
        </div>

        {/* Right Section - Desktop Navigation and User */}
        <div className="flex items-center gap-4">
          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-4">
            {navigationItems.map((item) => {
              const IconComponent = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 text-sm font-medium hover:text-[#6b0f1a] transition-colors ${!item.show ? "hidden" : ""}`}
                >
                  <IconComponent className="h-4 w-4 text-[#6b0f1a]" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Language Selector */}
          <div className="hidden md:block">
            <LanguageSelector />
          </div>

          {/* Mobile Hamburger Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden p-2"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5 text-[#6b0f1a]" /> : <Menu className="h-5 w-5 text-[#6b0f1a]" />}
          </Button>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarImage src="/abstract-geometric-shapes.png" alt="User" />
                  <AvatarFallback>{currentUser?.name?.slice(0, 2).toUpperCase() || "AD"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {isAgent ? t("user.agent", "Agent") : t("user.admin", "Admin")}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {currentUser?.email || "admin@viaggidelqatar.com"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
                {t("navigation.profile", "Profile")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/verify-receipt")}>
                {t("navigation.receiptVerification", "Receipt Verification")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                {t("navigation.settings", "Settings")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout()}>
                <LogOut className="mr-2 h-4 w-4" />
                {t("navigation.logout", "Logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={closeMobileMenu} />}

      {/* Mobile Menu Slide-out Panel */}
      <div
        className={`
        fixed top-16 right-0 z-50 h-[calc(100vh-4rem)] w-80 max-w-[85vw] 
        transform bg-background border-l shadow-xl transition-transform duration-300 ease-in-out lg:hidden
        ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}
      `}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Search Bar */}
          <div className="p-4 border-b sm:hidden">
            <HeaderSearch />
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-4 space-y-2">
            <div className="text-sm font-medium text-muted-foreground mb-4">
              {t("navigation.dashboard", "Navigation")}
            </div>
            {navigationItems.map((item) => {
              const IconComponent = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors ${!item.show ? "hidden" : ""}`}
                >
                  <IconComponent className="h-5 w-5 text-[#6b0f1a]" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}

            {/* Mobile Language Selector */}
            <div className="pt-4 border-t">
              <div className="text-sm font-medium text-muted-foreground mb-2">
                {t("language.selectLanguage", "Language")}
              </div>
              <LanguageSelector />
            </div>
          </nav>

          {/* Mobile Menu Footer */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/abstract-geometric-shapes.png" alt="User" />
                <AvatarFallback>{currentUser?.name?.slice(0, 2).toUpperCase() || "AD"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{isAgent ? t("user.agent", "Agent") : t("user.admin", "Admin")}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {currentUser?.email || "admin@viaggidelqatar.com"}
                </p>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  router.push("/dashboard/profile")
                  closeMobileMenu()
                }}
              >
                {t("navigation.profile", "Profile")}
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  router.push("/verify-receipt")
                  closeMobileMenu()
                }}
              >
                {t("navigation.receiptVerification", "Receipt Verification")}
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  router.push("/dashboard/settings")
                  closeMobileMenu()
                }}
              >
                {t("navigation.settings", "Settings")}
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => {
                  logout()
                  closeMobileMenu()
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {t("navigation.logout", "Logout")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// Add named export for compatibility
export { HeaderNavigation }
