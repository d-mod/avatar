/**
 *  json.shim
 */

 declare module "*.json" ;
 declare module "json!*";
 
 
 /***
  *  image.shim
  */
 
 declare module "*.svg"
 declare module "*.png"
 declare module "*.jpg"
 declare module "*.jpeg"
 declare module "*.gif"
 declare module "*.bmp"
 declare module "*.tiff"
 
 
 /**
  *  sheet-style.shim
  */
 declare module "*.scss";
 declare module "*.css";
 
/// <reference types="vite/client" />

declare module '*.vue' {
    import { DefineComponent } from 'vue'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
    const component: DefineComponent<{}, {}, any>
    export default component
}
  