import type { MarkdownParsedContent } from '@nuxt/content/dist/runtime/types'
import getReadingTime from '~/helpers/getReadingTime'

import dateFormatter from '~/utils/dateFormatter'

interface useGetAllPublishedPostsData extends MarkdownParsedContent {
  date: string
}

const transform = (data: useGetAllPublishedPostsData[]) => {
  if (!data && !data[0])
    return null

  const [raw] = data
  const readingTime = getReadingTime(raw.body)

  return {
    ...raw,
    durations: readingTime.minutes,
    date: dateFormatter(new Date(raw.date)),
  }
}

const useGetAllPublishedPosts = (path: string) => {
  const contentQuery = queryContent()

  const queryPathGetPublishedPost = () => contentQuery.where({ _path: { $eq: path } }).find().then(res => res as useGetAllPublishedPostsData[])

  return useAsyncData(queryPathGetPublishedPost, {
    default: () => null,
    transform,
  })
}

export default useGetAllPublishedPosts
