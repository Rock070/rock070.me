import type { MyCustomParsedContent } from '~/types/query'
import getReadingTime from '~/helpers/getReadingTime'

import dateFormatter from '~/utils/dateFormatter'

const transform = (data: MyCustomParsedContent) => {
  if (!data)
    return null

  const readingTime = getReadingTime(data.body)

  return {
    ...data,
    durations: readingTime.minutes,
    date_iso_string: data.date ? new Date(data.date).toISOString() : '',
    date_format: data.date ? dateFormatter(new Date(data.date)) : '',
  }
}

const useGetAllPublishedPosts = (path: string) => {
  const contentQuery = queryContent()

  const queryPathGetPublishedPost = contentQuery.find().then((res) => {
    const result = res.find((i) => {
      return i._path === path
    })
    return result as MyCustomParsedContent
  })

  return useAsyncData(() => queryPathGetPublishedPost, {
    default: () => null,
    transform,
  })
}

export default useGetAllPublishedPosts
