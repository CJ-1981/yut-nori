import { NextResponse } from "next/server";

// Mark this route as fully static so it works with `output: "export"`.
// (GitHub Pages / static hosting cannot run server-side code.)
export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json({ message: "Hello, world!" });
}