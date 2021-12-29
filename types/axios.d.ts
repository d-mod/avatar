import { AxiosStatic, AxiosRequestConfig } from "axios"

declare module "axios" {
    export class AxiosStatic {
        $get(url: string, config?: AxiosRequestConfig): any
        $post(url: string, config?: AxiosRequestConfig): any
        $delete(url: string, config?: AxiosRequestConfig): any
    }
}
