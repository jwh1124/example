import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";
export const maxDuration = 120;

const allowedRatios = new Set(["1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3", "5:4", "4:5", "21:9"]);
const allowedSizes = new Set(["1K", "2K", "4K"]);

type GenerateBody = {
  prompt?: string;
  aspectRatio?: string;
  imageSize?: string;
  referenceImage?: string | null;
};

function parseDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) return null;
  return { mimeType: match[1], data: match[2] };
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY가 설정되지 않았습니다." }, { status: 500 });
    }

    const body = (await request.json()) as GenerateBody;
    const prompt = body.prompt?.trim();
    const aspectRatio = allowedRatios.has(body.aspectRatio ?? "") ? body.aspectRatio! : "1:1";
    const imageSize = allowedSizes.has(body.imageSize ?? "") ? body.imageSize! : "1K";

    if (!prompt) {
      return NextResponse.json({ error: "프롬프트를 입력해주세요." }, { status: 400 });
    }

    if (prompt.length > 8000) {
      return NextResponse.json({ error: "프롬프트가 너무 깁니다. 8,000자 이하로 입력해주세요." }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const input: string | Array<Record<string, string>> = body.referenceImage
      ? (() => {
          const parsed = parseDataUrl(body.referenceImage!);
          if (!parsed) throw new Error("지원하지 않는 참고 이미지 형식입니다.");
          return [
            { type: "text", text: prompt },
            { type: "image", mime_type: parsed.mimeType, data: parsed.data },
          ];
        })()
      : prompt;

    const interaction = await ai.interactions.create({
      model: "gemini-3.1-flash-image",
      input,
      response_format: {
        type: "image",
        mime_type: "image/png",
        aspect_ratio: aspectRatio,
        image_size: imageSize,
      },
    });

    const generated = interaction.output_image;
    if (!generated?.data) {
      return NextResponse.json({ error: "이미지가 생성되지 않았습니다. 프롬프트를 바꿔 다시 시도해주세요." }, { status: 502 });
    }

    return NextResponse.json({
      image: `data:${generated.mime_type ?? "image/png"};base64,${generated.data}`,
      interactionId: interaction.id,
      model: "gemini-3.1-flash-image",
    });
  } catch (error) {
    console.error("Nano Banana generation error:", error);
    const message = error instanceof Error ? error.message : "이미지 생성 중 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
