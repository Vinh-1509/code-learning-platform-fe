// src/vite-env.d.ts  (thường đã có sẵn, append vào)
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
