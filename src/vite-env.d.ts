/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ModelContext {
  registerTool(tool: Record<string, unknown>, options?: { signal?: AbortSignal }): void | Promise<void>
}

interface Document { readonly modelContext?: ModelContext }
