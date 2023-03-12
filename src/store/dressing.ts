import { defineStore } from "pinia";
import { stringifyUrl } from "query-string";
import EMPTY_SRC from "@/assets/empty.png";
import api from "@/api";

export interface DressingState {
  profession_list?: Profession[]
  profession?: Profession
  icons: Record<string, Record<string, DressIcon[]>>
  parts: PartList
}
const part_titles: Record<string, string> = {
  hair: "头部",
  cap: "帽子",
  face: "脸部",
  neck: "胸部",
  coat: "上衣",
  skin: "皮肤",
  belt: "腰带",
  pants: "下装",
  shoes: "鞋"
};

function createDefault(part: string): PartValue {
  return {
    name: "",
    part,
    icon: EMPTY_SRC,
    images: [],
    code: "-1",
    title: part_titles[part]
  };
}

export const useDressingStore = defineStore("dressing", {
  state: (): DressingState => {
    return {
      profession_list: undefined,
      profession: undefined,
      icons: {},
      parts: {
        hair: createDefault("hair"),
        cap: createDefault("cap"),
        face: createDefault("face"),
        //   weapon: createDefault("weapon","武器"),
        neck: createDefault("neck"),
        coat: createDefault("coat"),
        skin: createDefault("skin"),
        belt: createDefault("belt"),
        pants: createDefault("pants"),
        shoes: createDefault("shoes")
      }
    };
  },
  getters: {
    profession_name(): string {
      return this.profession?.name ?? "swordman";
    }
  },
  actions: {
    async loadProfession() {
      this.profession_list = await api.getProfessionList();
      const last_profession = localStorage.getItem("last-profession") ?? this.profession_list[0].name;
      if (last_profession) {
        this.setProfessionName(last_profession);
      }
      return this.profession_list;
    },

    async setProfession(profession: Profession) {
      this.profession = profession;
      localStorage.setItem("last-profession", profession.name);
    },
    setProfessionName(name: string) {
      this.profession = this.profession_list?.find(e => e.name === name);
    },
    async getIcon(part: string): Promise<DressIcon[]> {
      return fetch(`/api/icon/${this.profession_name}/${part}`).then(r => r.json());
    },
    async getDressList(part: string): Promise<Dress[]> {
      const profession = this.profession_name;
      return await fetch(`/api/dress/${profession}/${part}`).then(r => r.json());
    },
    async getDress(profession: string, query: Record<string, string>): Promise<Dress[]> {
      return await fetch(
        stringifyUrl({
          url: `/api/dress/get/${this.profession_name}`,
          query
        })
      ).then(r => r.json());
    },
    resetPart(part: string) {
      this.parts[part] = createDefault(part);
    },
    selectDress(item: Dress) {
      let { part } = item;

      const num = Number(item.code);
      if (isNaN(num) || num === -1) {
        this.resetPart(part);
        return;
      }
      if (!part || !this.parts[part]) {
        // 确认具体的子武器种类
        part = "weapon";
      }
      this.parts[part] = Object.assign({ title: this.parts[part].title }, item);
    }
  }
});
