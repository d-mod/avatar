export {};

declare global {
  export function gtag(category: string, event: string, data: any): void;

  export const __APP_VERSION__: string;

  export const __LAST_MODIFIED__: number;

  export interface DressImage {
    name: string;
    width: number;
    height: number;
    x: number;
    y: number;
    z: number;
    url: string;
  }

  export interface Dress {
    name: string;
    icon: string;
    code: string;
    profession?: string;
    part: string;
    images: DressImage[];
    iconX?: number;
    iconY?: number;
    hash?: string;
  }

  export interface DressIcon {
    name: string;
    x: number;
    y: number;
  }

  export interface Weapon {
    name: string;
    label: string;
    aliases: string[];
  }

  export interface CodeTemplate {
    name?: string;
    query?: Record<string, string>;
  }

  export interface Profession extends CodeTemplate {
    name: string;
    label: string;
    sortNumber: number;
    weapons: Weapon[];
  }

  export interface CollocationQuery {
    keyword: string;
    size: number;
    page: number;
    year: number;
    type: string | 0;
  }
  export interface PartValue extends Dress {
    title?: string;
  }

  export type PartList = Record<string, PartValue>;

  export interface CodeQuery {
    part: string;
    code?: string;
    weapon?: string;
  }

  export interface CanvasProps {
    width: number;
    height: number;
    scale: number;
  }
}
