import { cn } from "@/lib/utils"

export const menuItemClassName =
  "focus:bg-accent focus:text-accent-foreground relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"

export const menuSubTriggerClassName =
  "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-hidden"

export const menuCheckboxItemClassName =
  "focus:bg-accent focus:text-accent-foreground relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-hidden data-[disabled]:pointer-events-none data-[disabled]:opacity-50"

export const menuRadioItemClassName =
  "focus:bg-accent focus:text-accent-foreground relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-hidden data-[disabled]:pointer-events-none data-[disabled]:opacity-50"

export const menuLabelClassName =
  "px-2 py-1.5 text-sm font-semibold"

export function getMenuLabelClassName(inset?: boolean, className?: string) {
  return cn(menuLabelClassName, inset && "pl-8", className)
}
