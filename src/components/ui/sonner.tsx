"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      toastOptions={{
        duration: 4000,
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-slate-900 group-[.toaster]:border-slate-200 group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl group-[.toaster]:border",
          title: "text-sm font-semibold text-slate-900",
          description: "text-sm text-slate-600",
          actionButton: "bg-amber-600 text-white hover:bg-amber-700 rounded-lg",
          cancelButton: "bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg",
          closeButton: "text-slate-400 hover:text-slate-600",
          error: "group-[.toaster]:bg-red-50 group-[.toaster]:text-red-800 group-[.toaster]:border-red-200",
          success: "group-[.toaster]:bg-emerald-50 group-[.toaster]:text-emerald-800 group-[.toaster]:border-emerald-200",
          warning: "group-[.toaster]:bg-amber-50 group-[.toaster]:text-amber-800 group-[.toaster]:border-amber-200",
          info: "group-[.toaster]:bg-blue-50 group-[.toaster]:text-blue-800 group-[.toaster]:border-blue-200",
        },
      }}
      style={
        {
          "--normal-bg": "#ffffff",
          "--normal-text": "#1a1a1a",
          "--normal-border": "#e2e8f0",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
