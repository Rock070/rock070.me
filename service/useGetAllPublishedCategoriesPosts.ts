import type { MyCustomParsedContent } from '~/types/query'
import getReadingTime from '~/helpers/getReadingTime'
import useCache from '@/composables/useCache'

import dateFormatter from '~/utils/dateFormatter'

function transform(data: MyCustomParsedContent[]) {
  if (!data)
    return []

  const { cache, update } = useCache()
  data.forEach((item) => {
    const c = item.categories
    if (Array.isArray(c))
      c.forEach(i => update(i, item))
    else update(c, item)
  })

  const entries = Object.entries(cache.value) as [string, MyCustomParsedContent[]][]

  return entries
    .map(([c, g]) => {
      return {
        category: c,
        list: g?.map((i) => {
          const readingTime = getReadingTime(i.body)

          return {
            ...i,
            durations: readingTime.minutes,
            date_iso_string: i.date ? new Date(i.date).toISOString() : '',
            date_format: i.date ? dateFormatter(new Date(i.date)) : '',
          }
        }),
      }
    })
}

const IGNORE_PATH = [
  '/',
  '/all-posts',
  '/categories',
]

function useGetAllPublishedCategoriesPosts() {
  const contentQuery = queryContent()

  const getAllPublishedPosts = () =>
    contentQuery
      .where({ _type: { $ne: 'yaml' } })
      .sort({ date: -1 })
      .find()
      .then((res) => {
        // 過濾草稿、空文章、首頁
        const posts = res.filter(item => !item.draft && !item._empty && !IGNORE_PATH.includes(item._path))

        return posts as MyCustomParsedContent[]
      })
  return useAsyncData(getAllPublishedPosts, {
    default: () => [],
    transform,
  })
}

export default useGetAllPublishedCategoriesPosts
