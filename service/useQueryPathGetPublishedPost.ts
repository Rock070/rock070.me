import type { MyCustomParsedContent } from '~/types/query'
import getReadingTime from '~/helpers/getReadingTime'

import dateFormatter from '~/utils/dateFormatter'

const transform = (data: MyCustomParsedContent[]) => {
  if (!data && !data[0])
    return null

  const [raw] = data
  const readingTime = getReadingTime(raw.body)

  return {
    ...raw,
    durations: readingTime.minutes,
    date_iso_string: new Date(raw.date).toISOString(),
    date_format: dateFormatter(new Date(raw.date)),
  }
}

const useGetAllPublishedPosts = (path: string) => {
  const contentQuery = queryContent()

  const queryPathGetPublishedPost = () => contentQuery.where({ _path: { $eq: path } }).find().then(res => res as MyCustomParsedContent[])

  return useAsyncData(queryPathGetPublishedPost, {
    default: () => null,
    transform,
  })
}

export default useGetAllPublishedPosts
