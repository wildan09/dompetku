// Type declarations for Deno runtime APIs used in Supabase Edge Functions
declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined
    set(key: string, value: string): void
    delete(key: string): void
    has(key: string): boolean
    toObject(): Record<string, string>
  }
  export const env: Env
}

// Allow importing from URLs (Deno-style imports)
declare module 'https://*' {
  const mod: any
  export default mod
  export const serve: any
}
