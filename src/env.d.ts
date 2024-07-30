/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";

  const component: DefineComponent;
  export default component;
}

interface ImportMetaEnv {
  /**
   *  应用服务地址
   */
  readonly APP_API_URL: string;

  PROD: boolean;
  DEV: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
