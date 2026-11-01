import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Readable } from "stream";
import prisma from "@/lib/prisma";
import { getSession, verifySessionToken, SessionPayload } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Resolves the absolute path and MIME type of the bundled classical audio sample.
 */
function resolveAudioFile(): { filePath: string; contentType: string } | null {
  const candidates = [
    {
      filePath: path.join(process.cwd(), "assets", "audio", "classical-vocal-aria.mp3"),
      contentType: "audio/mpeg",
    },
    {
      filePath: path.join(process.cwd(), "assets", "audio", "classical-vocal-aria.wav"),
      contentType: "audio/wav",
    },
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate.filePath)) {
      return candidate;
    }
  }

  return null;
}

/**
 * Validates session authentication from cookies, Authorization header, or URL search param token.
 */
async function authenticateRequest(req: Request): Promise<SessionPayload | null> {
  let session = await getSession(req);
  if (session) return session;

  try {
    const url = new URL(req.url);
    const tokenQuery = url.searchParams.get("token");
    if (tokenQuery) {
      session = await verifySessionToken(tokenQuery);
    }
  } catch {
    // Malformed URL, ignore query token
  }

  return session;
}

/**
 * Handles audio streaming with support for HTTP Range headers (206 Partial Content),
 * full file downloads (200 OK), and metadata probes (HEAD).
 */
async function handleAudioStream(req: Request, props: RouteParams, isHead: boolean = false) {
  try {
    const session = await authenticateRequest(req);
    if (!session) {
      return NextResponse.json(
        { error: "Требуется авторизация", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    if (session.role !== "JURY" && session.role !== "ADMIN") {
      return NextResponse.json(
        {
          error: "Доступ к аудиопотоку разрешен только экспертам жюри и администраторам",
          code: "FORBIDDEN",
        },
        { status: 403 }
      );
    }

    const { id } = await props.params;

    const application = await prisma.application.findFirst({
      where: {
        OR: [{ id }, { code: id }],
      },
      include: {
        evaluations: {
          where: session.role === "ADMIN" ? {} : { juryUserId: session.userId },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Конкурсная заявка не найдена", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    // Strict Jury Assignment Verification
    if (session.role !== "ADMIN" && application.evaluations.length === 0) {
      return NextResponse.json(
        {
          error: "Доступ запрещен: заявка не назначена данному эксперту жюри",
          code: "NOT_ASSIGNED",
        },
        { status: 403 }
      );
    }

    const audioInfo = resolveAudioFile();
    if (!audioInfo) {
      console.error("[AudioStream] Audio sample file not found in assets/audio/");
      return NextResponse.json(
        {
          error: "Аудиоматериал конкурсного выступления недоступен на сервере",
          code: "MEDIA_UNAVAILABLE",
        },
        { status: 500 }
      );
    }

    const { filePath, contentType } = audioInfo;
    const stat = await fs.promises.stat(filePath);
    const fileSize = stat.size;

    const rangeHeader = req.headers.get("range");

    // Standard headers for blind audio streaming
    const baseHeaders: Record<string, string> = {
      "Accept-Ranges": "bytes",
      "Content-Type": contentType,
      "Cache-Control": "private, no-cache, no-store, must-revalidate",
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": 'inline; filename="classical-vocal-aria.mp3"',
    };

    if (rangeHeader) {
      // Range format: bytes=start-end
      const rangeMatch = rangeHeader.match(/bytes=(\d*)-(\d*)/);
      if (!rangeMatch) {
        return new NextResponse(null, {
          status: 416,
          headers: {
            "Content-Range": `bytes */${fileSize}`,
            "Accept-Ranges": "bytes",
          },
        });
      }

      let start = rangeMatch[1] ? parseInt(rangeMatch[1], 10) : NaN;
      let end = rangeMatch[2] ? parseInt(rangeMatch[2], 10) : NaN;

      // Handle suffix range (e.g. bytes=-500)
      if (isNaN(start) && !isNaN(end)) {
        start = Math.max(0, fileSize - end);
        end = fileSize - 1;
      } else if (!isNaN(start) && isNaN(end)) {
        end = fileSize - 1;
      }

      // Range boundary validation
      if (isNaN(start) || isNaN(end) || start < 0 || start >= fileSize || end >= fileSize || start > end) {
        return new NextResponse(null, {
          status: 416,
          headers: {
            "Content-Range": `bytes */${fileSize}`,
            "Accept-Ranges": "bytes",
          },
        });
      }

      const chunkSize = end - start + 1;
      const headers = {
        ...baseHeaders,
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Content-Length": String(chunkSize),
      };

      if (isHead) {
        return new NextResponse(null, { status: 206, headers });
      }

      const nodeStream = fs.createReadStream(filePath, { start, end });
      const webStream = Readable.toWeb(nodeStream);

      return new NextResponse(webStream as unknown as BodyInit, {
        status: 206,
        headers,
      });
    }

    // Full audio response (200 OK)
    const headers = {
      ...baseHeaders,
      "Content-Length": String(fileSize),
    };

    if (isHead) {
      return new NextResponse(null, { status: 200, headers });
    }

    const nodeStream = fs.createReadStream(filePath);
    const webStream = Readable.toWeb(nodeStream);

    return new NextResponse(webStream as unknown as BodyInit, {
      status: 200,
      headers,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Audio stream handler error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервиса воспроизведения аудио", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request, props: RouteParams) {
  return handleAudioStream(req, props, false);
}

export async function HEAD(req: Request, props: RouteParams) {
  return handleAudioStream(req, props, true);
}
