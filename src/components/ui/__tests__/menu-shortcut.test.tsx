import { describe, test, expect } from "bun:test"
import React from "react"
import { renderToString } from "react-dom/server"
import { MenuShortcut } from "@/components/ui/menu-shortcut"
import { DropdownMenuShortcut } from "@/components/ui/dropdown-menu"
import { ContextMenuShortcut } from "@/components/ui/context-menu"
import { MenubarShortcut } from "@/components/ui/menubar"
import { CommandShortcut } from "@/components/ui/command"

describe("MenuShortcut and delegates", () => {
  test("MenuShortcut renders span with data-slot and classes", () => {
    const html = renderToString(<MenuShortcut className="custom-class">⌘K</MenuShortcut>)
    expect(html).toContain('data-slot="menu-shortcut"')
    expect(html).toContain('text-muted-foreground ml-auto text-xs tracking-widest custom-class')
    expect(html).toContain("⌘K")
  })

  test("DropdownMenuShortcut delegates to MenuShortcut with correct data-slot", () => {
    const html = renderToString(<DropdownMenuShortcut className="test-dropdown">⌘D</DropdownMenuShortcut>)
    expect(html).toContain('data-slot="dropdown-menu-shortcut"')
    expect(html).toContain('test-dropdown')
    expect(html).toContain("⌘D")
  })

  test("ContextMenuShortcut delegates to MenuShortcut with correct data-slot", () => {
    const html = renderToString(<ContextMenuShortcut className="test-context">⌘C</ContextMenuShortcut>)
    expect(html).toContain('data-slot="context-menu-shortcut"')
    expect(html).toContain('test-context')
    expect(html).toContain("⌘C")
  })

  test("MenubarShortcut delegates to MenuShortcut with correct data-slot", () => {
    const html = renderToString(<MenubarShortcut className="test-menubar">⌘M</MenubarShortcut>)
    expect(html).toContain('data-slot="menubar-shortcut"')
    expect(html).toContain('test-menubar')
    expect(html).toContain("⌘M")
  })

  test("CommandShortcut delegates to MenuShortcut with correct data-slot", () => {
    const html = renderToString(<CommandShortcut className="test-command">⌘K</CommandShortcut>)
    expect(html).toContain('data-slot="command-shortcut"')
    expect(html).toContain('test-command')
    expect(html).toContain("⌘K")
  })
})
