import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    // Tokens are stored in localStorage (not cookies) because frontend and backend 
    // are on different domains. We cannot check localStorage in middleware (server-side),
    // so we allow all /user/* routes through here and let each page's client-side 
    // auth check handle redirection if needed.
    return NextResponse.next();
}

export const config = {
    matcher: ["/user/:path*"],
};