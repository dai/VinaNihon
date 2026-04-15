/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
/// <reference types="@cloudflare/workers-types/latest" />

declare module "cloudflare:workers" {
  export const env: Record<string, string | undefined>;
}
