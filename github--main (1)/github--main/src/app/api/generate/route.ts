import { NextResponse } from "next/server";

type ReqBody = {
  prompt?: string;
  type?: string;
  aspect?: string;
  token?: string;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// curated Unsplash fallback
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1549880338-65ddcdfd017b?auto=format&fit=crop&w=1400&q=80";

export async function POST(request: Request) {
  try {
    const body: ReqBody = await request.json().catch(() => ({}));
    const prompt = body.prompt ?? "abstract neon terminal landscape";
    const type = body.type ?? "image";
    const aspect = body.aspect ?? "16:9";

    // prefer token sent from client (unlocked via security gate) then server env
    const token = body.token ?? (process.env.REPLICATE_API_TOKEN || process.env.NEXT_PUBLIC_REPLICATE_API_TOKEN || null);

    // if no token, simulate processing but DO NOT quietly enable features — return fallback so UI can display a result if permitted
    if (!token) {
      await sleep(2000);
      return NextResponse.json(
        {
          ok: true,
          provider: "mock",
          url: FALLBACK_IMAGE,
          meta: { prompt, type, aspect, note: "REPLICATE_API_TOKEN not set; returned Unsplash mock image" },
        },
        { status: 200 }
      );
    }

    // Best-effort call to Replicate (replace model & payload as needed)
    try {
      const resp = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          // Replace with your actual model/version and inputs
          version: "stable-diffusion-2",
          input: {
            prompt,
            aspect_ratio: aspect,
            type,
          },
        }),
      });

      if (!resp.ok) {
        const text = await resp.text();
        return NextResponse.json({ ok: false, error: "Replicate API error", detail: text }, { status: 502 });
      }

      const data = await resp.json();

      // Defensive parse for common shapes of output
      let url: string | null = null;
      if (data?.output) {
        if (Array.isArray(data.output) && data.output.length > 0 && typeof data.output[0] === "string") {
          url = data.output[0];
        } else if (typeof data.output === "string") {
          url = data.output;
        } else if (data.output?.[0]?.url) {
          url = data.output[0].url;
        }
      }

      if (!url) {
        return NextResponse.json(
          { ok: true, provider: "replicate", url: FALLBACK_IMAGE, meta: { prompt, type, aspect, warning: "no media URL found in replicate response", replicate: data } },
          { status: 200 }
        );
      }

      return NextResponse.json({ ok: true, provider: "replicate", url, meta: { prompt, type, aspect } }, { status: 200 });
    } catch (err) {
      return NextResponse.json({ ok: false, error: "Replicate request failed", detail: String(err), fallback: FALLBACK_IMAGE }, { status: 500 });
    }
  } catch (e) {
    return NextResponse.json({ ok: false, error: "invalid request" }, { status: 400 });
  }
}
