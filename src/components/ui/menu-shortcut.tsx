import * as React from "react"
import { cn } from "@/lib/utils"

export interface MenuShortcutProps extends React.ComponentProps<"span"> {
  "data-slot"?: string
}

export function MenuShortcut({
  className,
  "data-slot": dataSlot = "menu-shortcut",
  ...props
}: MenuShortcutProps) {
  return (
    <span
      data-slot={dataSlot}
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className
      )}
      {...props}
    />
  )
}
