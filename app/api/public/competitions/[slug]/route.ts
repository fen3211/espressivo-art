import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _req: Request,
  props: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await props.params;

    const competition = await prisma.competition.findUnique({
      where: { slug },
      include: {
        nominations: {
          orderBy: { code: "asc" },
        },
        ageCategories: {
          orderBy: { minAge: "asc" },
        },
      },
    });

    if (!competition) {
      return NextResponse.json({ error: "Конкурс не найден" }, { status: 404 });
    }

    // Fetch public jury members
    const juryUsers = await prisma.user.findMany({
      where: { role: "JURY", isActive: true },
      select: {
        id: true,
        fullName: true,
        avatarUrl: true,
      },
    });

    return NextResponse.json({
      id: competition.id,
      slug: competition.slug,
      titleRu: competition.titleRu,
      titleEn: competition.titleEn,
      descriptionRu: competition.descriptionRu,
      descriptionEn: competition.descriptionEn,
      heroImageUrl: competition.heroImageUrl,
      status: competition.status,
      entryFee: competition.entryFee,
      currency: competition.currency,
      startDate: competition.startDate.toISOString(),
      endDate: competition.endDate.toISOString(),
      judgingEndDate: competition.judgingEndDate.toISOString(),
      nominations: competition.nominations.map((n) => ({
        id: n.id,
        code: n.code,
        titleRu: n.titleRu,
        titleEn: n.titleEn,
        descriptionRu: n.descriptionRu,
      })),
      ageCategories: competition.ageCategories.map((a) => ({
        id: a.id,
        code: a.code,
        titleRu: a.titleRu,
        titleEn: a.titleEn,
        minAge: a.minAge,
        maxAge: a.maxAge,
      })),
      jury: juryUsers.map((j) => ({
        id: j.id,
        fullName: j.fullName,
        avatarUrl: j.avatarUrl || "/avatars/jury-placeholder.jpg",
        title: "Член международного жюри / Jury Member",
      })),
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Public competition by slug error:", error);
    return NextResponse.json({ error: "Ошибка загрузки информации о конкурсе" }, { status: 500 });
  }
}
