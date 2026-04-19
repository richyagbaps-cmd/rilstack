import { NextResponse } from "next/server";

const COOKIE_NAMES = [
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
  "next-auth.csrf-token",
  "__Host-next-auth.csrf-token",
  "next-auth.callback-url",
  "__Secure-next-auth.callback-url",
];

function clearAuthCookies(response: NextResponse) {
  COOKIE_NAMES.forEach((name) => {
    response.cookies.set(name, "", {
      path: "/",
      expires: new Date(0),
      httpOnly: name.includes("session-token") || name.includes("csrf-token"),
      secure: name.startsWith("__Secure-") || name.startsWith("__Host-"),
      sameSite: "lax",
    });
  });
}

export async function POST() {
  const response = NextResponse.json({ success: true });
  clearAuthCookies(response);
  return response;
}
