import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ user: null });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        teacherProfile: true,
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        teacherProfile: user.teacherProfile
          ? {
              id: user.teacherProfile.id,
              referralCode: user.teacherProfile.referralCode,
              balance: user.teacherProfile.balance,
              commissionRate: user.teacherProfile.commissionRate,
              organization: user.teacherProfile.organization,
            }
          : null,
      },
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Auth me error:", error);
    return NextResponse.json({ user: null });
  }
}
