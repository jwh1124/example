# Nano Banana 2 Image Bot

Next.js 기반 Nano Banana 2 이미지 생성/편집 웹앱입니다.

- Model: `gemini-3.1-flash-image` (Nano Banana 2)
- Text-to-image
- Reference image editing
- Aspect ratio selection
- 1K / 2K / 4K output
- Server-side API key protection
- Generated image download

## Local run

```bash
npm install
cp .env.example .env.local
```

`.env.local`:

```env
GEMINI_API_KEY=YOUR_GOOGLE_AI_STUDIO_KEY
```

Then:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Deploy to Vercel

1. Import this GitHub repository into Vercel.
2. Select the `nano-banana-image-bot` branch for deployment.
3. Add environment variable:
   - Name: `GEMINI_API_KEY`
   - Value: your Gemini API key
4. Deploy.

> Do not put the Gemini API key in browser-side JavaScript or commit `.env.local`.

## API

`POST /api/generate`

Example body:

```json
{
  "prompt": "A cinematic photograph of Seoul at dawn",
  "aspectRatio": "16:9",
  "imageSize": "2K",
  "referenceImage": null
}
```

The server calls Google's Gemini Interactions API through `@google/genai` using `gemini-3.1-flash-image`.
