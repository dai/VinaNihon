# VinaNihon

ベトナム語↔日本語に特化した、シンプルな翻訳MVPです。  
トップページでそのまま翻訳でき、言い換え・ニュアンス・返信例まで確認できます。

## Stack

- Astro + TypeScript
- Cloudflare Pages (`@astrojs/cloudflare`)
- Astro API routes (`/api/translate`, `/api/reply`)
- Provider abstraction (`mock` / `openai`)

## Local Setup (Astro dev)

1. Install dependencies:

```bash
npm install
```

2. Create local env file:

```bash
cp .env.example .env
```

3. (Optional) enable real provider in `.env`:

```dotenv
TRANSLATION_PROVIDER=openai
OPENAI_API_KEY=your_api_key
# Optional
OPENAI_MODEL=gpt-4.1-mini
```

4. Run:

```bash
npm run dev
```

5. Open: `http://localhost:4321`

## Environment Variables

For Astro local development, use `.env`.

- `TRANSLATION_PROVIDER=mock` (default)
- `OPENAI_API_KEY=` (required when `TRANSLATION_PROVIDER=openai`)
- `OPENAI_MODEL=gpt-4.1-mini` (optional)

For Cloudflare Pages runtime, set the same variables in Pages project settings.

If you use Wrangler local runtime, `.dev.vars` is also supported.

## Routes

### `POST /api/translate`

Request:

```json
{
  "sourceLang": "ja",
  "targetLang": "vi",
  "text": "こんにちは",
  "mode": "daily",
  "tone": "normal"
}
```

Response:

```json
{
  "mainTranslation": "...",
  "alternatives": ["..."],
  "nuanceNotes": ["..."],
  "context": {
    "sourceLang": "ja",
    "targetLang": "vi",
    "mode": "daily",
    "tone": "normal"
  }
}
```

### `POST /api/reply`

Request:

```json
{
  "sourceLang": "ja",
  "targetLang": "vi",
  "originalText": "こんにちは",
  "mainTranslation": "...",
  "mode": "daily",
  "tone": "normal"
}
```

Response:

```json
{
  "suggestedReplies": ["..."]
}
```

## Provider Architecture

`src/lib/translate.ts` provides a service abstraction:

- `mock` provider: always available fallback
- `openai` provider: calls `POST https://api.openai.com/v1/responses`

API route contracts are unchanged. `/api/translate` and `/api/reply` stay thin and delegate to the service layer.

## Scripts

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run check`
