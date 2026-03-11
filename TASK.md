You are working in the GitHub repository "VinaNihon".

Build the first working MVP of a simple Japanese ↔ Vietnamese translation web app.

Project goals:
- Internal / friends-only use
- Prioritize usability over visual polish
- The top page should be immediately usable as a tool
- Keep the design minimal and clean
- No authentication
- No database
- No analytics
- No UI framework unless truly necessary

Tech stack:
- Astro
- TypeScript
- Cloudflare Pages
- Astro server routes for backend endpoints
- Minimal client-side JavaScript

Product direction:
- The homepage should focus on only these three goals:
  1. Users can translate immediately from the first view
  2. The value of a Japanese ↔ Vietnamese specialized translator is obvious
  3. The UI is self-explanatory without instructions

Pages and routes:
- `/` = top page and translator UI
- `/api/translate` = POST endpoint
- `/api/reply` = POST endpoint

UI requirements for `/`:
- App title: VinaNihon
- Subtitle in Japanese:
  ベトナム語↔日本語を、自然に翻訳
- Short description in Japanese:
  直訳だけでなく、場面に合う言い換えや返信例も出します。
- Source language selector
- Target language selector
- Swap button
- Large textarea
- Mode selector:
  - daily
  - work
  - customer-service
  - hospital
- Tone selector:
  - casual
  - normal
  - polite
- Translate submit button
- Result area with:
  - main translation
  - alternatives
  - nuance notes
  - suggested replies

Implementation requirements:
- Keep `/` simple and mobile-friendly
- Use plain Astro components
- Use minimal inline client-side JS only where needed
- Keep styles in a small global CSS file
- Use mocked responses first
- Structure code so a real AI/translation provider can be added later
- API routes should be dynamic with `export const prerender = false`

Files to implement:
- src/layouts/BaseLayout.astro
- src/components/TranslatorForm.astro
- src/components/TranslationResult.astro
- src/pages/index.astro
- src/pages/api/translate.ts
- src/pages/api/reply.ts
- src/lib/types.ts
- src/lib/prompt.ts
- src/lib/translate.ts
- src/styles/global.css
- wrangler.jsonc
- README.md
- .dev.vars.example

Behavior:
- Submit the form to `/api/translate`
- Then call `/api/reply` with the translated result
- Show all returned sections in the result card
- Gracefully handle loading and error states
- Keep code readable and small

Provider architecture:
- Add a translation service abstraction in `src/lib/translate.ts`
- Support `mock` provider now
- Leave a clean placeholder for a future `openai` provider
- Read secrets from environment variables
- Do not implement the real provider yet unless asked

Please:
1. inspect the repo structure
2. generate or update the needed files
3. keep the implementation minimal
4. explain what you changed
5. suggest the next smallest task after this