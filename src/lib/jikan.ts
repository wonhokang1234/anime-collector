const JIKAN_BASE = "https://api.jikan.moe/v4";

export interface JikanAnime {
  mal_id: number;
  title: string;
  images: {
    jpg: {
      image_url: string;
      large_image_url: string;
    };
  };
  score: number | null;
  episodes: number | null;
  synopsis: string | null;
  genres: { name: string }[];
  studios: { name: string }[];
  year: number | null;
  season: string | null;
  aired: {
    prop: {
      from: { year: number | null };
    };
  };
}

interface JikanSearchResponse {
  data: JikanAnime[];
  pagination: {
    has_next_page: boolean;
    last_visible_page: number;
  };
}

interface JikanTopResponse {
  data: JikanAnime[];
}

export async function searchAnime(query: string): Promise<JikanAnime[]> {
  const res = await fetch(
    `${JIKAN_BASE}/anime?q=${encodeURIComponent(query)}&limit=20&sfw=true`
  );
  if (!res.ok) throw new Error("Jikan API error");
  const json: JikanSearchResponse = await res.json();
  return json.data;
}

export async function getTopAnime(): Promise<JikanAnime[]> {
  const res = await fetch(`${JIKAN_BASE}/top/anime?limit=25&sfw=true`);
  if (!res.ok) throw new Error("Jikan API error");
  const json: JikanTopResponse = await res.json();
  return json.data;
}

export function getAnimeYear(anime: JikanAnime): number | null {
  return anime.year ?? anime.aired?.prop?.from?.year ?? null;
}
