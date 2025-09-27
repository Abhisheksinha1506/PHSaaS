"use client"

import * as React from "react"
import { Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button 
        variant="outline" 
        size="icon"
        className="hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 transition-all duration-300 hover:scale-110"
      >
        <Sun className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="relative hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 transition-all duration-300 hover:scale-110 group"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 group-hover:rotate-12" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 group-hover:-rotate-12" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}