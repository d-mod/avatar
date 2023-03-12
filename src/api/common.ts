import type { AxiosInstance } from "axios";
import axios from "axios";

const commonInstance = axios.create({
  baseURL: "/api",
  timeout: 10000
});

export function defineRequest<T>(fn: (axios: AxiosInstance) => T): T {
  return fn(commonInstance);
}
