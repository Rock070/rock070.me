import type { MyCustomParsedContent } from '~/types/query'
import getReadingTime from '~/helpers/getReadingTime'

import group from '~/utils/group'
import dateFormatter from '~/utils/dateFormatter'

const transform = (data: MyCustomParsedContent[]) => {
  if (!data)
    return []
  // FIXME: 分類陣列應該都要有，而不能只有取 [0]
  const groupPost = group(data, current => Array.isArray(current.categories) ? current.categories[0] : current.categories || '')

  const entries = Object.entries(groupPost)

  return entries
    .map(([c, g]) => {
      return {
        category: c,
        list: g.map((i) => {
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

const useGetAllPublishedCategoriesPosts = () => {
  const contentQuery = queryContent('/posts')
  const getAllPublishedPosts = () => contentQuery.find().then((res) => {
    const posts = res.filter(item => !item.draft)

    return posts as MyCustomParsedContent[]
  })
  return useAsyncData(getAllPublishedPosts, {
    default: () => [],
    transform,
  })
}

export default useGetAllPublishedCategoriesPosts
