import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Вы успешно вышли из системы" });
  return clearAuthCookie(response);
}
