import { describe, expect, test } from "bun:test"
import { sanitizeColor, sanitizeId, sanitizeKey } from "./chart"

describe("Chart Security Sanitization", () => {
  describe("sanitizeId", () => {
    test("allows alphanumeric, hyphen, and underscore characters", () => {
      expect(sanitizeId("chart-123_abc")).toBe("chart-123_abc")
    })

    test("strips special characters, spaces, and HTML/CSS syntax", () => {
      expect(sanitizeId('chart-1"] { } </style><script>alert(1)</script>')).toBe(
        "chart-1stylescriptalert1script"
      )
      expect(sanitizeId("<svg/onload=alert(1)>")).toBe("svgonloadalert1")
    })
  })

  describe("sanitizeKey", () => {
    test("allows alphanumeric, hyphen, and underscore keys", () => {
      expect(sanitizeKey("desktop_users-2024")).toBe("desktop_users-2024")
    })

    test("strips invalid characters that could inject CSS properties or HTML tags", () => {
      expect(
        sanitizeKey("key; } </style><script>alert('xss')</script>")
      ).toBe("keystylescriptalertxssscript")
    })
  })

  describe("sanitizeColor", () => {
    test("allows safe CSS color formats", () => {
      expect(sanitizeColor("hsl(var(--chart-1))")).toBe("hsl(var(--chart-1))")
      expect(sanitizeColor("#2563eb")).toBe("#2563eb")
      expect(sanitizeColor("rgb(255, 0, 0)")).toBe("rgb(255, 0, 0)")
      expect(sanitizeColor("red")).toBe("red")
      expect(sanitizeColor("hsl(220 14.3% 95.9%)")).toBe(
        "hsl(220 14.3% 95.9%)"
      )
    })

    test("removes dangerous HTML and CSS characters", () => {
      const sanitized = sanitizeColor('red; } </style><script>alert("xss")</script>')
      expect(sanitized).not.toContain("<")
      expect(sanitized).not.toContain(">")
      expect(sanitized).not.toContain(";")
      expect(sanitized).not.toContain("{")
      expect(sanitized).not.toContain("}")
      expect(sanitized).not.toContain('"')
      expect(sanitized).not.toContain("'")
    })

    test("blocks javascript: and url() schemes", () => {
      expect(sanitizeColor("javascript:alert(1)")).toBe("")
      expect(sanitizeColor("url('https://evil.com')")).toBe("")
      expect(sanitizeColor("expression(alert(1))")).toBe("")
    })
  })
})
