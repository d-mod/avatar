import type { Collocation, CollocationType } from "./types";
import { defineRequest } from "./common";

export interface CollocationRequest {
  keyword?: string;
  profession?: string;
  type?: string;
  year?: number;
}

export interface DressListRequest {
  profession?: string;
  part?: string;
  keyword?: string;
}

export default defineRequest((axios) => {
  return {
    async getCollocationList(request: CollocationRequest) {
      return await axios
        .get<Collocation[]>("/collocation/list", {
          params: request
        })
        .then((r) => r.data);
    },
    async getCollocationTypes() {
      return await axios.get<CollocationType[]>("/collocation/types").then((r) => r.data);
    },
    async getCollocationYears() {
      return await axios.get<number[]>("/collocation/years").then((r) => r.data);
    },
    async getProfessionList() {
      return await axios.get<Profession[]>("/profession/list").then((r) => r.data);
    },
    async getDressList(request: DressListRequest) {
      return await axios
        .get<Dress[]>(`/dress/${request.profession}/${request.part}`, {
          params: {
            keyword: request.keyword
          }
        })
        .then((r) => r.data);
    },
    async getDressDetail(code: string) {
      return await axios
        .get<Dress>("/dress/detail", {
          params: {
            code
          }
        })
        .then((r) => r.data);
    },
    async getDressIcons(request: { profession: string; part: string }) {
      return await axios.get<DressIcon[]>(`/icon/${request.profession}/${request.part}`).then((r) => r.data);
    }
  };
});
