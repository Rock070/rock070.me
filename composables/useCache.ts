import { ref } from 'vue'

type InitialCache = Record<string, any[] | null> | {}

function useCache(initial: InitialCache = {}) {
  const cache = ref({ ...initial })
  const update = (key: string, val: any) => {
    if (!cache.value[key]) {
      cache.value[key] = [val]
      return
    }
    if (cache.value[key])
      cache.value[key]!.push(val)
  }

  return {
    cache,
    update,
  }
}

export default useCache
