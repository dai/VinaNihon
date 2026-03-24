# VinaNihon（ゔぃなにほん）🇯🇵🇻🇳

[日本語](README.md)

Đây là một MVP dịch thuật đơn giản, tập trung vào tiếng Việt 🇻🇳 ↔ tiếng Nhật 🇯🇵.  
Bạn có thể dịch trực tiếp ngay trên trang chủ, đồng thời xem các cách diễn đạt khác, sắc thái ý nghĩa và ví dụ trả lời.

Phần nhập liệu hỗ trợ nhập giọng nói và đọc văn bản. Mỗi phần trong kết quả dịch cũng hỗ trợ đọc lại.

<img src="93.jpg" width="300" alt="Giao diện VinaNihon ở chế độ sáng, hiển thị tiếng Nhật 日本語 JP ở ô nhập bên trái với nút hoán đổi sang tiếng Việt ベトナム語 VN bên phải. Ứng dụng hiển thị các phần được gắn nhãn cho Chế độ đặt thành trò chuyện hàng ngày và Giọng điệu đặt thành bình thường, với nút dịch màu gradient từ xanh sang cam ở dưới cùng. Giao diện bao gồm các nút micro và loa để nhập và phát âm thanh"> <img src="92.jpg" width="300" alt="Giao diện VinaNihon ở chế độ tối với bố cục nền sáng, hiển thị cùng thiết lập dịch hai chiều giữa tiếng Nhật và tiếng Việt với các điều khiển chế độ và giọng điệu giống hệt. Chủ đề tối mang lại vẻ ngoài hiện đại và chuyên nghiệp với các nút tương tác và tính năng truy cập giống nhau">

## Stack

- Astro + TypeScript
- Cloudflare Pages (`@astrojs/cloudflare`)
- Astro API routes (`/api/translate`, `/api/reply`)
- Provider abstraction (`mock` / `openai`)

## Thiết lập cục bộ (Astro dev)

1. Cài dependencies:

```bash
npm install
```

2. Tạo file env cục bộ:

```bash
cp .env.example .env
```

3. (Tùy chọn) bật provider thật trong `.env`:

```dotenv
TRANSLATION_PROVIDER=openai
OPENAI_API_KEY=your_api_key
# Optional
OPENAI_MODEL=gpt-4.1-mini
OPENAI_BASE_URL=https://api.openai.com/v1
```

Nếu muốn dùng API tương thích OpenAI nhưng vẫn giữ `openai` provider:

```dotenv
TRANSLATION_PROVIDER=openai
OPENAI_API_KEY=your_compatible_api_key
OPENAI_MODEL=MiniMax-M2.5
OPENAI_BASE_URL=https://api.minimax.io/v1
```

4. Chạy:

```bash
npm run dev
```

5. Mở: `http://localhost:4321`

## Bắt đầu nhanh

Nếu cấu hình `.env` như dưới đây, ứng dụng sẽ dùng bản dịch OpenAI thật:

```dotenv
TRANSLATION_PROVIDER=openai
OPENAI_API_KEY=your_api_key
OPENAI_MODEL=gpt-4.1-mini
OPENAI_BASE_URL=https://api.openai.com/v1
```

Sau đó chạy `npm run dev` và thực hiện dịch ngay từ trang chủ.

Nếu đổi `TRANSLATION_PROVIDER` về `mock`, ứng dụng sẽ quay lại chế độ mock ngay lập tức.

Nếu muốn dùng MiniMax với `openai` provider, dùng cấu hình sau:

```dotenv
TRANSLATION_PROVIDER=openai
OPENAI_API_KEY=your_minimax_api_key
OPENAI_MODEL=MiniMax-M2.5
OPENAI_BASE_URL=https://api.minimax.io/v1
```

## Biến môi trường

Trong môi trường phát triển Astro cục bộ, dùng `.env`.

- `TRANSLATION_PROVIDER=mock` (mặc định)
- `OPENAI_API_KEY=` (bắt buộc khi `TRANSLATION_PROVIDER=openai`)
- `OPENAI_MODEL=gpt-4.1-mini` (tùy chọn)
- `OPENAI_BASE_URL=https://api.openai.com/v1` (tùy chọn)

Đối với runtime trên Cloudflare Pages, hãy đặt cùng các biến đó trong phần cài đặt của dự án Pages.

Nếu dùng runtime cục bộ của Wrangler, `.dev.vars` cũng được hỗ trợ.

## Thiết lập Cloudflare Pages

Dự án này được cấu hình cho Cloudflare Pages Functions.

### `wrangler.jsonc`

`wrangler.jsonc` hiện bao gồm:

- `pages_build_output_dir: "./dist"`
- `compatibility_flags: ["nodejs_compat"]`
- KV binding `SESSION` cho Astro sessions
- `env.preview` hiện dùng cùng KV namespace `SESSION` với production
- Không có trường `main`, vì repository này deploy lên Cloudflare Pages chứ không phải standalone Worker

Nếu sau này muốn tách biệt Preview và Production, bạn có thể thêm một Preview KV namespace riêng.

### 1. Tạo KV namespace `SESSION`

```bash
npx wrangler kv namespace create SESSION
```

Sao chép ID được trả về vào `wrangler.jsonc`:

```jsonc
"kv_namespaces": [
  {
    "binding": "SESSION",
    "id": "your-session-kv-id"
  }
]
```

Nếu sau này muốn có Preview KV riêng, hãy thêm namespace khác và override trong `env.preview`.

### 2. Cấu hình dự án Pages

Trong Cloudflare Pages:

- Kết nối repository GitHub này
- Build command: `npm run build`
- Build output directory: `dist`
- Phiên bản Node.js: `22`

### 3. Thêm biến môi trường

Trong phần cài đặt dự án Pages, thêm các biến runtime giống như trong `.env` cục bộ.

Ví dụ:

- `TRANSLATION_PROVIDER=mock`
- `TRANSLATION_PROVIDER=openai` cùng với `OPENAI_API_KEY`
- `TRANSLATION_PROVIDER=openai` cùng với `OPENAI_BASE_URL=https://api.minimax.io/v1`

### 4. Gắn KV namespace vào Pages

Trong phần cài đặt dự án Pages, thêm một KV binding:

- Tên biến: `SESSION`
- KV namespace: chính namespace đang dùng trong `wrangler.jsonc`

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
  "suggestedReplies": ["..."],
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

## Kiến trúc provider

`src/lib/translate.ts` cung cấp lớp trừu tượng cho service:

- `mock` provider: fallback luôn sẵn sàng
- `openai` provider: gọi `POST https://api.openai.com/v1/responses`
  Nếu đổi `OPENAI_BASE_URL` sang một endpoint tương thích OpenAI, hệ thống sẽ tự chọn `responses` hoặc `chat/completions` tùy backend đó.

Contract của API routes không thay đổi. `/api/translate` và `/api/reply` vẫn chỉ đóng vai trò mỏng và ủy quyền cho service layer.

Trang chủ dùng một request `/api/translate`, nên bản dịch và các câu trả lời gợi ý được tạo trong một lần gọi provider. `/api/reply` vẫn được giữ lại như endpoint riêng để tương thích ngược.

Đối với Cloudflare Pages CI, script build sẽ xóa các file sinh ra như `_worker.js/wrangler.json`, `_worker.js/.dev.vars` và `.wrangler/deploy/config.json` sau khi `astro build`. Script cũng sao chép `_worker.js/entry.mjs` sang `_worker.js/index.js` vì trình upload Pages hiện tại yêu cầu tên file đó khi deploy.

## API Smoke Test (cục bộ)

Sau khi khởi động dev server, bạn có thể kiểm tra API bằng các lệnh sau.

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

## Khắc phục sự cố

- Nút nhập giọng nói bị vô hiệu hóa
  - Cần có `SpeechRecognition` hoặc `webkitSpeechRecognition`. Thường có trên các trình duyệt họ Chrome.
- Giọng đọc không đúng như mong muốn
  - Các giọng đọc khả dụng phụ thuộc vào trình duyệt và hệ điều hành. Tiếng Nhật ưu tiên `ja-JP`, tiếng Việt ưu tiên `vi-VN`.
- `OPENAI_API_KEY is required when TRANSLATION_PROVIDER=openai.`
  - Hãy kiểm tra xem `.env` đã có `OPENAI_API_KEY` hay chưa.
- Muốn dùng MiniMax bằng `openai` provider
  - Hãy đặt `OPENAI_BASE_URL=https://api.minimax.io/v1` và `OPENAI_MODEL=MiniMax-M2.5`.
- Xuất hiện lỗi phía OpenAI liên quan đến `json_object`
  - Phần triển khai đã có bổ sung chỉ dẫn `json` trong input. Hãy dừng tiến trình dev server cũ và khởi động lại.
- `npm run check` báo lỗi thiếu `@rollup/rollup-linux-x64-gnu`
  - Đây là vấn đề optional dependency của npm. Hãy chạy lại `npm i`.

## Scripts

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run check`
