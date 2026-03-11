# VinaNihon

ベトナム語↔日本語に特化した、シンプルな翻訳MVPです。  
トップページでそのまま翻訳でき、言い換え・ニュアンス・返信例まで確認できます。

## Stack

- Astro + TypeScript
- Cloudflare Pages (`@astrojs/cloudflare`)
- Astro API routes (`/api/translate`, `/api/reply`)
- Mock translation provider (real provider is pluggable later)

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
cp .dev.vars.example .dev.vars
```

3. Run dev server:

```bash
npm run dev
```

4. Open:

`http://localhost:4321`

## Environment Variables

`.dev.vars` (or Cloudflare Pages environment variables):

- `TRANSLATION_PROVIDER=mock` (default)
- `OPENAI_API_KEY=` (reserved for future `openai` provider)

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

- `mock` provider: implemented and used by default
- `openai` provider: placeholder only (throws not-implemented error)

This keeps API handlers stable while allowing a real provider to be added later.

## Cloudflare Pages

- Build command: `npm run build`
- Output directory: `dist`
- Runtime config is in `wrangler.jsonc`

## Scripts

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run check`
