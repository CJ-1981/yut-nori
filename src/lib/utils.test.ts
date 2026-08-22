import { describe, expect, it } from "bun:test"
import { cn } from "./utils"

describe("cn utility", () => {
  it("should merge simple string class names", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1")
  })

  it("should handle conditional classes and falsy values", () => {
    expect(cn("px-2", true && "py-1", false && "bg-red-500", null, undefined)).toBe("px-2 py-1")
  })

  it("should merge conflicting Tailwind CSS classes correctly", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4")
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500")
  })

  it("should handle object syntax for classes", () => {
    expect(cn({ "bg-red-500": true, "text-white": false, "p-4": true })).toBe("bg-red-500 p-4")
  })

  it("should handle array inputs including nested arrays", () => {
    expect(cn(["px-2", ["py-1", "bg-red-500"]])).toBe("px-2 py-1 bg-red-500")
  })

  it("should handle empty arguments or no arguments", () => {
    expect(cn()).toBe("")
    expect(cn("", null, undefined)).toBe("")
  })
})
