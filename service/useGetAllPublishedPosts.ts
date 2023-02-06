import type { MyCustomParsedContent } from '~/types/query'
import getReadingTime from '~/helpers/getReadingTime'

import group from '~/utils/group'
import dateFormatter from '~/utils/dateFormatter'

const transform = (data: MyCustomParsedContent[]) => {
  if (!data)
    return []
  const clone = [...data]

  const groupPost = group(clone, (current) => {
    if (current.date === undefined)
      return ''
    return new Date(current.date).getFullYear() || ''
  })

  const entries = Object.entries(groupPost)

  return entries
    .reverse()
    .map(([y, g]) => {
      return {
        year: y,
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

const useGetAllPublishedPosts = () => {
  const contentQuery = queryContent('/posts/')
  const getAllPublishedPosts = () => contentQuery
    .sort({ date: -1 })
    .find()
    .then((res) => {
      const posts = res.filter(item => !item.draft && !item._empty)

      return posts as MyCustomParsedContent[]
    })
  return useAsyncData(getAllPublishedPosts, {
    default: () => [],
    transform,
  })
}

export default useGetAllPublishedPosts
