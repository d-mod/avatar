import type { Collocation, CollocationType } from "@/api/types";
import { createQuery, createSingletonPromise, defineRouter, memoize } from "@fourze/core";
import axios from "axios";

export default defineRouter((router) => {
  const axiosInstance = axios.create({
    baseURL: import.meta.env.APP_API_URL,
    headers: {
      "X-Fourze-Mock": "off"
    }
  });

  const getCollocation = createSingletonPromise<{
    types: CollocationType[];
    list: Collocation[];
  }>(() => axiosInstance.get("/api/collocation.json").then((r) => r.data));

  router.route("/profession/list", () => {
    return axiosInstance.get("/api/profession.json").then((r) => r.data);
  });

  router.route(
    "/collocation/list",
    {
      props: {
        profession: {
          type: String
        },
        keyword: {
          type: String
        },
        type: {
          type: String
        },
        year: {
          type: Number
        }
      }
    },
    memoize(
      async (req) => {
        const collocationsState = await getCollocation();
        const list = createQuery(collocationsState.list)
          .where((e) => {
            let rs = true;
            if (req.data.keyword) {
              rs &&= e.name.includes(req.data.keyword);
            }
            if (req.data.profession) {
              rs &&= e.profession === req.data.profession;
            }
            if (req.data.type) {
              rs &&= e.type === req.data.type;
            }
            return rs;
          })
          .select();
        return list.toArray();
      },
      {
        serialize: (req) => JSON.stringify(req.data)
      }
    )
  );

  router.route("/collocation/types", async () => {
    const collocationsState = await getCollocation();
    const list = createQuery(collocationsState.list);
    const types = list
      .select((e) => e.type)
      .distinct()
      .toArray();
    return collocationsState.types.filter((e) => types.includes(e.name));
  });

  router.route("/collocation/years", async () => {
    const collocationsState = await getCollocation();
    const list = createQuery(collocationsState.list);
    const rs = list
      .select((e) => e.year)
      .where((r) => !!r)
      .select()
      .distinct();
    return Array.from(rs).sort((a, b) => b - a);
  });

  const getDressList = memoize(async (profession: string, part: string) => {
    let list: Dress[] = await axiosInstance.get<Dress[]>(`/api/${profession}/${part}.json`).then((r) => r.data);
    list = list.map((e) =>
      Object.assign(e, {
        profession,
        part,
        icon: `/icon/${profession}/${part}/${e.code}.png`
      })
    );
    return list;
  });

  const getDressIcons = memoize(async (profession: string, part: string) => {
    return await axiosInstance.get(`/icon/${profession}/${part}.json`).then((r) => r.data);
  });

  router.route(
    "/dress/get/{profession}",
    {
      props: {
        profession: {
          type: String,
          required: true,
          in: "path"
        }
      }
    },
    async (req) => {
      const profession = req.params.profession;
      const query = req.query as Record<string, string>;
      const tasks: Promise<Dress | undefined>[] = [];
      for (const part in query) {
        const code = Number(query[part]);
        if (code === -1) {
          continue;
        }
        tasks.push(getDressList(profession, part).then((r) => r.find((e) => Number(e.code) === code)));
      }
      const array = await Promise.all(tasks);
      return array.filter((r) => !!r);
    }
  );

  router.route(
    "/dress/{profession}/{part}",
    {
      props: {
        profession: {
          type: String,
          required: true,
          in: "path"
        },
        part: {
          type: String,
          required: true,
          in: "path"
        }
      }
    },
    (req) => {
      const { profession, part } = req.params;
      return getDressList(profession, part);
    }
  );

  router.get(
    "/icon/{profession}/{part}",
    {
      props: {
        profession: {
          type: String,
          required: true,
          in: "path"
        },
        part: {
          type: String,
          required: true,
          in: "path"
        }
      }
    },
    async (req) => {
      const { profession, part } = req.params;
      return getDressIcons(profession, part);
    }
  );
});
