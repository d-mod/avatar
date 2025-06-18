import { asyncComputed } from "@vueuse/core";
import { defineStore } from "pinia";
import queryString from "query-string";
import { computed, reactive, ref } from "vue";
import api from "@/api";
import EMPTY_SRC from "@/assets/empty.png";

export interface DressingState {
  profession_list?: Profession[];
  profession?: Profession;
  icons: Record<string, Record<string, DressIcon[]>>;
  parts: PartList;
}

export const PART_TITLES = {
  hair: "头部",
  cap: "帽子",
  face: "脸部",
  neck: "胸部",
  coat: "上衣",
  skin: "皮肤",
  belt: "腰带",
  pants: "下装",
  shoes: "鞋"
} as Record<string, string>;

function createDefault(part: string): PartValue {
  return {
    name: "",
    part,
    icon: EMPTY_SRC,
    images: [],
    code: "-1",
    title: PART_TITLES[part]
  };
}

export const useDressingStore = defineStore("dressing", () => {
  const parts = reactive(
    Object.fromEntries(
      Object.keys(PART_TITLES).map((part) => {
        return [part, createDefault(part)];
      })
    ) as PartList
  );

  const professionList = asyncComputed(async () => {
    return await api.getProfessionList();
  }, []);

  const currentProfessionName = ref("swordman");

  const currentProfession = computed(() => {
    return professionList.value?.find((profession) => profession.name === currentProfessionName.value);
  });

  async function getDressList(part: string): Promise<Dress[]> {
    const profession = currentProfessionName.value;
    const r = await fetch(`/api/dress/${profession}/${part}`);
    return await r.json();
  }

  async function getDress(profession: string, query: Record<string, string>): Promise<Dress[]> {
    const r = await fetch(
      queryString.stringifyUrl({
        url: `/api/dress/get/${profession}`,
        query
      })
    );
    return await r.json();
  }

  function selectDress(item: Dress) {
    const { part } = item;

    const num = Number(item.code);
    if (Number.isNaN(num) || num === -1) {
      resetPart(part);
      return;
    }
    if (!part || !parts[part]) {
      return;
    }
    parts[part] = item;
  }

  function resetPart(part: string) {
    parts[part] = createDefault(part);
  }

  return {
    professionList,
    parts,
    currentProfessionName,
    currentProfession,
    getDressList,
    getDress,
    selectDress,
    resetPart,
    createDefault
  };
});
