import { createQuery, createSingletonPromise, defineRouter } from "@fourze/core";
import axios from "axios";
import type { Collocation, CollocationType } from "@/api/types";

interface CachePromiseItem<R> {
  value: Promise<R>
  time: number
}

interface CachePromiseReturn<R, P extends any[]> {
  (...args: P): Promise<R>
  evict: (...args: P) => boolean
  evictByKey: (key: string) => boolean
  evictBy: (fn: (item: CachePromiseItem<R>, key: string) => boolean) => boolean
  evictExpired: (maxAge: number) => boolean
  clear: () => void
  set: (key: string, value: Promise<R> | R) => void
  get(key: string): Promise<R> | undefined
  raw: (...args: P) => Promise<R>
  new: (...args: P) => Promise<R>
}

interface CachePromiseOptions<_, P extends any[]> {
  serialize?: (...args: P) => string
  expire?: number
}

function createCachePromise<R, P extends any[]>(fn: (...args: P) => Promise<R> | R, options: CachePromiseOptions<R, P> = {}): CachePromiseReturn<R, P> {
  const cache = new Map<string, CachePromiseItem<R>>();
  const serialize = options.serialize ?? ((...args: P) => JSON.stringify(args));
  const wrapper = ((...args: P) => {
    const key = serialize(...args);
    const item = cache.get(key);
    if (!item) {
      return wrapper.new(...args);
    } else {
      if (options.expire && Date.now() - item.time > options.expire) {
        cache.delete(key);
        return wrapper(...args);
      }
      return item.value;
    }
  }) as CachePromiseReturn<R, P>;

  wrapper.clear = () => {
    cache.clear();
  };

  // q: why not use `wrapper.evict`?
  // a: because `wrapper.evict` will serialize the arguments again
  wrapper.evictBy = (fn: (item: CachePromiseItem<R>, key: string) => boolean) => {
    return Array.from(cache.entries()).some(([key, item]) => {
      if (fn(item, key)) {
        return cache.delete(key);
      }
      return false;
    });
  };

  wrapper.evictByKey = (key: string) => {
    return cache.delete(key);
  };

  wrapper.evict = (...args: P) => {
    const key = serialize(...args);
    return wrapper.evictByKey(key);
  };

  wrapper.evictExpired = (maxAge: number) => {
    return wrapper.evictBy(item => Date.now() - item.time > maxAge);
  };

  wrapper.set = (key: string, value: Promise<R> | R) => {
    cache.set(key, {
      value: Promise.resolve(value),
      time: Date.now()
    });
  };

  wrapper.get = (key: string) => {
    const item = cache.get(key);
    if (item) {
      return item.value;
    }
  };

  wrapper.raw = (...args: P) => {
    return Promise.resolve(fn(...args));
  };

  wrapper.new = (...args: P) => {
    const key = serialize(...args);
    const promise = wrapper.raw(...args);
    cache.set(key, {
      value: promise,
      time: Date.now()
    });
    return promise;
  };

  return wrapper;
}

export default defineRouter(router => {
  const axiosInstance = axios.create({
    baseURL: "https://avatar.kritsu.net",
    headers: {
      "X-Fourze-Mock": "off"
    }
  });

  const getCollocation = createSingletonPromise<{
    types: CollocationType[]
    list: Collocation[]
  }>(() => axiosInstance.get("/api/collocation.json").then(r => r.data));

  router.route("/profession/list", () => {
    return axiosInstance.get("/api/profession.json").then(r => r.data);
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
    async req => {
      const collocationsState = await getCollocation();
      const list = createQuery(collocationsState.list)
        .where(e => {
          if (req.data.keyword) {
            return e.name.includes(req.data.keyword);
          }
          return true;
        })
        .and(e => {
          if (req.data.profession) {
            return e.profession === req.data.profession;
          }
          return true;
        })
        .and(e => {
          if (req.data.type) {
            return e.type === req.data.type;
          }
          return true;
        })
        .and(e => {
          if (req.data.year) {
            return e.year === Number(req.data.year);
          }
          return true;
        })
        .select();
      return list.toArray();
    }
  );

  router.route("/collocation/types", async () => {
    const collocationsState = await getCollocation();
    const list = createQuery(collocationsState.list);
    const types = list
      .select(e => e.type)
      .distinct()
      .toArray();
    return collocationsState.types.filter(e => types.includes(e.name));
  });

  router.route("/collocation/years", async () => {
    const collocationsState = await getCollocation();
    const list = createQuery(collocationsState.list);
    const rs = list
      .select(e => e.year)
      .where(r => !!r)
      .select()
      .distinct();
    return Array.from(rs).sort((a, b) => b - a);
  });

  const getDressList = createCachePromise(async (profession: string, part: string) => {
    let list: Dress[] = await axiosInstance.get<Dress[]>(`/api/${profession}/${part}.json`).then(r => r.data);
    list = list.map(e =>
      Object.assign(e, {
        profession,
        part,
        icon: `/icon/${profession}/${part}/${e.code}.png`
      })
    );
    return list;
  });

  const getDressIcons = createCachePromise(async (profession: string, part: string) => {
    return await axiosInstance.get(`/icon/${profession}/${part}.json`).then(r => r.data);
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
    async req => {
      const profession = req.params.profession;
      const query = req.query as Record<string, string>;
      const tasks: Promise<Dress | undefined>[] = [];
      for (const part in query) {
        const code = Number(query[part]);
        if (code === -1) {
          continue;
        }
        tasks.push(getDressList(profession, part).then(r => r.find(e => Number(e.code) === code)));
      }
      const array = await Promise.all(tasks);
      return array.filter(r => !!r);
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
    req => {
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
    async req => {
      const { profession, part } = req.params;
      return getDressIcons(profession, part);
    }
  );
});
