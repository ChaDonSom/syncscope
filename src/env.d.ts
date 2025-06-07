/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_INSTANTDB_PROJECT_ID: string
  readonly NODE_ENV: string
  // Add more env variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module "*.vue" {
  import type { DefineComponent } from "vue"
  const component: DefineComponent<{}, {}, any>
  export default component
}
