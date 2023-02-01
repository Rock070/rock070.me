import type { MyCustomParsedContent } from '~/types/query'
import getReadingTime from '~/helpers/getReadingTime'
import isValidaDate from '~~/utils/isValidaDate'

import group from '~/utils/group'
import dateFormatter from '~/utils/dateFormatter'

const transform = (data: MyCustomParsedContent[]) => {
  if (!data)
    return []
  const clone = [...data]
  clone.sort((a, b) => {
    if (!a.date || !b.date)
      return 1
    const dateA = new Date(a.date)
    const dateB = new Date(b.date)
    if (!isValidaDate(dateA) || !isValidaDate(dateB))
      return 1

    return dateA > dateB ? -1 : 1
  })

  const groupPost = group(clone, (current) => {
    if (current.date === undefined)
      return ''
    return new Date(current.date).getFullYear() || ''
  })

  const entries = Object.entries(groupPost)

  return entries
    .sort(([a], [b]) => {
      const [numA, numB] = [Number(a), Number(b)]

      if (Number.isNaN(numA) || Number.isNaN(numB))
        return 0
      return numB - numA
    }) // 年份越新，排序越往前
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
  const contentQuery = queryContent('/posts')
  const getAllPublishedPosts = () => contentQuery.find().then((res) => {
    const posts = res.filter(item => !item.draft && !item._empty)

    return posts as MyCustomParsedContent[]
  })
  return useAsyncData(getAllPublishedPosts, {
    default: () => [],
    transform,
  })
}

export default useGetAllPublishedPosts
