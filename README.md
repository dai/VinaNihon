# VinaNihon

ベトナム語↔日本語に特化した、シンプルな翻訳MVPです。  
トップページでそのまま翻訳でき、言い換え・ニュアンス・返信例まで確認できます。

## Stack

- Astro + TypeScript
- Cloudflare Pages (`@astrojs/cloudflare`)
- Astro API routes (`/api/translate`, `/api/reply`)
- Provider abstraction (`mock` / `openai` / `alibaba` / `minimax` / `aws-translate`)

## Local Setup (Astro dev)

1. Install dependencies:

```bash
npm install
```

2. Create local env file:

```bash
cp .env.example .env
```

3. (Optional) enable a real provider in `.env`:

```dotenv
TRANSLATION_PROVIDER=openai
OPENAI_API_KEY=your_api_key
# Optional
OPENAI_MODEL=gpt-4.1-mini
OPENAI_BASE_URL=https://api.openai.com/v1
```

OpenAI-compatible API を `openai` provider のまま使う場合:

```dotenv
TRANSLATION_PROVIDER=openai
OPENAI_API_KEY=your_compatible_api_key
OPENAI_MODEL=MiniMax-M1
OPENAI_BASE_URL=https://api.minimax.io/v1
```

Alibaba Cloud (DashScope compatible mode) を使う場合:

```dotenv
TRANSLATION_PROVIDER=alibaba
DASHSCOPE_API_KEY=your_dashscope_api_key
# Optional
ALIBABA_MODEL=qwen3-max
ALIBABA_BASE_URL=https://dashscope-intl.aliyuncs.com/api/v2/apps/protocols/compatible-mode/v1
```

MiniMax を使う場合:

```dotenv
TRANSLATION_PROVIDER=minimax
MINIMAX_API_KEY=your_minimax_api_key
# Optional
MINIMAX_MODEL=MiniMax-M1
MINIMAX_BASE_URL=https://api.minimax.io/v1
```

AWS Translate を使う場合:

```dotenv
TRANSLATION_PROVIDER=aws-translate
AWS_REGION=ap-northeast-1
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
# Optional
AWS_SESSION_TOKEN=
```

4. Run:

```bash
npm run dev
```

5. Open: `http://localhost:4321`

## Quick Start

`.env` を以下のように設定すると、実際の OpenAI 翻訳を使えます。

```dotenv
TRANSLATION_PROVIDER=openai
OPENAI_API_KEY=your_api_key
OPENAI_MODEL=gpt-4.1-mini
OPENAI_BASE_URL=https://api.openai.com/v1
```

その後 `npm run dev` を起動し、トップページから翻訳を実行してください。

`TRANSLATION_PROVIDER` を `mock` に戻すと、即座にモック動作へ切り替わります。

MiniMax を `openai` provider のまま使う場合は次の設定です。

```dotenv
TRANSLATION_PROVIDER=openai
OPENAI_API_KEY=your_minimax_api_key
OPENAI_MODEL=MiniMax-M1
OPENAI_BASE_URL=https://api.minimax.io/v1
```

Alibaba Cloud を使う場合は次の設定です。

```dotenv
TRANSLATION_PROVIDER=alibaba
DASHSCOPE_API_KEY=your_dashscope_api_key
ALIBABA_MODEL=qwen3-max
ALIBABA_BASE_URL=https://dashscope-intl.aliyuncs.com/api/v2/apps/protocols/compatible-mode/v1
```

MiniMax を使う場合は次の設定です。

```dotenv
TRANSLATION_PROVIDER=minimax
MINIMAX_API_KEY=your_minimax_api_key
MINIMAX_MODEL=MiniMax-M1
MINIMAX_BASE_URL=https://api.minimax.io/v1
```

AWS Translate を使う場合は次の設定です。

```dotenv
TRANSLATION_PROVIDER=aws-translate
AWS_REGION=ap-northeast-1
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_SESSION_TOKEN=
```

## Environment Variables

For Astro local development, use `.env`.

- `TRANSLATION_PROVIDER=mock` (default)
- `OPENAI_API_KEY=` (required when `TRANSLATION_PROVIDER=openai`)
- `OPENAI_MODEL=gpt-4.1-mini` (optional)
- `OPENAI_BASE_URL=https://api.openai.com/v1` (optional)
- `DASHSCOPE_API_KEY=` (required when `TRANSLATION_PROVIDER=alibaba`)
- `ALIBABA_MODEL=qwen3-max` (optional)
- `ALIBABA_BASE_URL=https://dashscope-intl.aliyuncs.com/api/v2/apps/protocols/compatible-mode/v1` (optional)
- `MINIMAX_API_KEY=` (required when `TRANSLATION_PROVIDER=minimax`)
- `MINIMAX_MODEL=MiniMax-M1` (optional)
- `MINIMAX_BASE_URL=https://api.minimax.io/v1` (optional)
- `AWS_REGION=` (required when `TRANSLATION_PROVIDER=aws-translate`)
- `AWS_ACCESS_KEY_ID=` and `AWS_SECRET_ACCESS_KEY=` (required unless runtime credentials are provided another way)
- `AWS_SESSION_TOKEN=` (optional)

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
  `OPENAI_BASE_URL` を OpenAI-compatible endpoint に切り替えた場合は、その backend に応じて `responses` または `chat/completions` を自動選択
- `alibaba` provider: calls Alibaba Cloud DashScope OpenAI-compatible `POST /responses`
- `minimax` provider: calls MiniMax OpenAI-compatible `POST /chat/completions`
- `aws-translate` provider: calls Amazon Translate for direct translation; reply examples are template-based because AWS Translate is not a generative model

API route contracts are unchanged. `/api/translate` and `/api/reply` stay thin and delegate to the service layer.

## API Smoke Test (local)

開発サーバー起動後に、以下で API の疎通確認ができます。

```bash
curl -s -X POST http://localhost:4321/api/translate \
  -H "content-type: application/json" \
  -d '{
    "sourceLang":"ja",
    "targetLang":"vi",
    "text":"こんにちは",
    "mode":"daily",
    "tone":"normal"
  }'
```

```bash
curl -s -X POST http://localhost:4321/api/reply \
  -H "content-type: application/json" \
  -d '{
    "sourceLang":"ja",
    "targetLang":"vi",
    "originalText":"こんにちは",
    "mainTranslation":"Xin chào",
    "mode":"daily",
    "tone":"normal"
  }'
```

## Troubleshooting

- `OPENAI_API_KEY is required when TRANSLATION_PROVIDER=openai.`
  - `.env` に `OPENAI_API_KEY` が設定されているか確認してください。
- MiniMax を `openai` provider で使いたい
  - `OPENAI_BASE_URL=https://api.minimax.io/v1` と `OPENAI_MODEL=MiniMax-M1` を設定してください。
- `DASHSCOPE_API_KEY is required when TRANSLATION_PROVIDER=alibaba.`
  - `.env` に `DASHSCOPE_API_KEY` が設定されているか確認してください。
- `MINIMAX_API_KEY is required when TRANSLATION_PROVIDER=minimax.`
  - `.env` に `MINIMAX_API_KEY` が設定されているか確認してください。
- `AWS_REGION is required when TRANSLATION_PROVIDER=aws-translate.`
  - `.env` に `AWS_REGION` が設定されているか確認してください。
- OpenAI 側エラーで `json_object` 関連メッセージが出る
  - 実装側で `json` 指示を入力に含める対応済みです。古い dev サーバープロセスを停止して再起動してください。
- AWS Translate では言い換え候補やニュアンス説明は生成されない
  - 現在は direct translation と reply template を返す実装です。生成品質が必要なら `openai` / `alibaba` / `minimax` を使ってください。
- `npm run check` で `@rollup/rollup-linux-x64-gnu` 欠落エラー
  - npm の optional dependency 問題です。`npm i` を再実行してください。

## Scripts

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run check`
