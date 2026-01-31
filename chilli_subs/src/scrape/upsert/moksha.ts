import { prisma } from "../../server/prisma";
import { normalizeName } from "../normalise/pubName";

type SourceLike = { puburl: string; name?: string; key?: string };

export async function upsertPublication(source: SourceLike, publication: any) {
  const name = normalizeName(publication.title || publication.name || publication.baseURL || source.name || "unknown");

  try {
    const result = await prisma.publicationInfo.upsert({
      where: { name_sourceUrl: { name, sourceUrl: source.puburl } },
      create: {
        name,
        title: publication.title ?? null,
        baseURL: publication.baseURL ?? null,
        pubURL: publication.pubURL ?? null,
        guidelineURL: publication.guidelineURL ?? null,
        description: publication.description ?? null,
        genres: publication.genres ?? [],
        submissions: publication.submissions ?? [],
        sourceUrl: source.puburl,
        // isOpen: publication.isOpen ?? false,
        updatedAt: new Date(),
      },
           update: {
        title: publication.title ?? undefined,
        baseURL: publication.baseURL ?? undefined,
        pubURL: publication.pubURL ?? undefined,
        guidelineURL: publication.guidelineURL ?? undefined,
        description: publication.description ?? undefined,
        genres: publication.genres ?? undefined,
        submissions: publication.submissions ?? undefined,
        // isOpen: publication.isOpen ?? false,
        updatedAt: new Date(),
      },
    });

    return result;
  } catch (err) {
    console.error("upsertPublication error:", err);
    throw err;
  }
}