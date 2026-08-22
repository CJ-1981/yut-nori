import * as React from "react"

import { cn } from "@/lib/utils"

function MenuShortcut({
  className,
  "data-slot": dataSlot = "menu-shortcut",
  ...props
}: React.ComponentProps<"span">) {
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

export { MenuShortcut }
