import type { MarkdownParsedContent } from '@nuxt/content/dist/runtime/types'
import getReadingTime from '~/helpers/getReadingTime'

import group from '~/utils/group'
import dateFormatter from '~/utils/dateFormatter'

interface useGetAllPublishedPostsData extends MarkdownParsedContent {
  date: string
}

const transform = (data: useGetAllPublishedPostsData[]) => {
  if (!data)
    return []

  const groupPost = group(data, current => new Date(current.date).getFullYear() || '')

  const entries = Object.entries(groupPost)

  return entries
    .sort(([a], [b]) => {
      const numA = Number(a)
      const numB = Number(b)
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
            date: dateFormatter(new Date(i.date)),
          }
        }),
      }
    })
}

const useGetAllPublishedPosts = () => {
  const contentQuery = queryContent()
  const getAllPublishedPosts = () => contentQuery.find().then((res) => {
    const posts = res.filter(item => !item.draft).filter(item => item._path && /^\/posts/.test(item._path))

    return posts as useGetAllPublishedPostsData[]
  })
  return useAsyncData(getAllPublishedPosts, {
    default: () => [],
    transform,
  })
}

export default useGetAllPublishedPosts
