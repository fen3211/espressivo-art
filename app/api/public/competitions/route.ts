import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const competitions = await prisma.competition.findMany({
      where: {
        // Show OPEN, UPCOMING, JUDGING, COMPLETED (hide internal DRAFT)
        status: { in: ["OPEN", "UPCOMING", "JUDGING", "COMPLETED"] },
      },
      include: {
        _count: {
          select: { nominations: true },
        },
      },
      orderBy: { startDate: "desc" },
    });

    const result = competitions.map((comp) => ({
      id: comp.id,
      slug: comp.slug,
      titleRu: comp.titleRu,
      titleEn: comp.titleEn,
      descriptionRu: comp.descriptionRu,
      descriptionEn: comp.descriptionEn,
      heroImageUrl: comp.heroImageUrl,
      status: comp.status,
      entryFee: comp.entryFee,
      currency: comp.currency,
      startDate: comp.startDate.toISOString(),
      endDate: comp.endDate.toISOString(),
      nominationsCount: comp._count.nominations,
    }));

    return NextResponse.json(result);
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Public competitions error:", error);
    return NextResponse.json({ error: "Ошибка загрузки списка конкурсов" }, { status: 500 });
  }
}
