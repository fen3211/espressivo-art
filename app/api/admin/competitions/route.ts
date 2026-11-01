import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    await requireRole(req, ["ADMIN"]);

    const competitions = await prisma.competition.findMany({
      include: {
        nominations: true,
        ageCategories: true,
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(competitions);
  } catch (err: unknown) {
    const error = err as Error & { status?: number };
    console.error("Admin competitions GET error:", error);
    return NextResponse.json(
      { error: error.message || "Ошибка загрузки списка конкурсов" },
      { status: error.status || 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await requireRole(req, ["ADMIN"]);

    const body = await req.json();
    const {
      slug,
      titleRu,
      titleEn,
      descriptionRu,
      descriptionEn,
      heroImageUrl,
      status,
      entryFee,
      currency,
      startDate,
      endDate,
      judgingEndDate,
      nominations,
      ageCategories,
    } = body;

    if (!slug || !titleRu || !titleEn || !startDate || !endDate || !judgingEndDate) {
      return NextResponse.json(
        { error: "Заполните обязательные поля конкурса (slug, названия, даты)" },
        { status: 400 }
      );
    }

    const competition = await prisma.competition.create({
      data: {
        slug: String(slug).trim().toLowerCase(),
        titleRu: String(titleRu).trim(),
        titleEn: String(titleEn).trim(),
        descriptionRu: String(descriptionRu || "").trim(),
        descriptionEn: String(descriptionEn || "").trim(),
        heroImageUrl: heroImageUrl ? String(heroImageUrl).trim() : null,
        status: status || "OPEN",
        entryFee: entryFee ? Number(entryFee) : 2500,
        currency: currency || "RUB",
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        judgingEndDate: new Date(judgingEndDate),
        nominations: {
          create: (nominations || []).map((n: { code: string; titleRu: string; titleEn: string; descriptionRu?: string }) => ({
            code: n.code,
            titleRu: n.titleRu,
            titleEn: n.titleEn,
            descriptionRu: n.descriptionRu,
          })),
        },
        ageCategories: {
          create: (ageCategories || []).map((a: { code: string; titleRu: string; titleEn: string; minAge: number; maxAge: number }) => ({
            code: a.code,
            titleRu: a.titleRu,
            titleEn: a.titleEn,
            minAge: Number(a.minAge),
            maxAge: Number(a.maxAge),
          })),
        },
      },
      include: {
        nominations: true,
        ageCategories: true,
      },
    });

    return NextResponse.json({ competition, message: "Конкурс успешно создан" }, { status: 201 });
  } catch (err: unknown) {
    const error = err as Error & { status?: number };
    console.error("Admin competitions POST error:", error);
    return NextResponse.json(
      { error: error.message || "Ошибка при создании конкурса" },
      { status: error.status || 500 }
    );
  }
}
