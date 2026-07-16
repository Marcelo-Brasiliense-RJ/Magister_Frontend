/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Permite `import logo from './logo.svg'`.
declare module '*.svg' {
  const src: string;
  export default src;
}
