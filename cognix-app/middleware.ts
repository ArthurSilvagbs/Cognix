import { NextResponse, type NextRequest } from "next/server";

// Passthrough — auth protection is handled in server layouts
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
