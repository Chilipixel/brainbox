/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
interface ModelContext {
  registerTool(tool: Record<string, unknown>, options?: { signal?: AbortSignal }): void | Promise<void>
}

interface Document { readonly modelContext?: ModelContext }
