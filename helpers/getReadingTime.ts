interface Item {
  type: string
  value?: string
  [key: string]: any
}

interface Group extends Item {
  children?: Item[]
  [key: string]: any
}

interface ReadingTime {
  minutes: number
  time: number
  count: {
    words: number
    char: number
  }
}

const READ_PER_MIN = 550 // 假設一分鐘閱讀 550 字

const getwords = (body: Group | undefined) => {
  let collect = ''
  const goCollect = (node: Group | undefined) => {
    if (!node)
      return
    if (node?.children) {
      for (const child of node.children)
        goCollect(child)
    }

    if (node.type === 'text')
      collect += node.value
  }

  goCollect(body)

  return collect
}
const getReadingTime = (body: Group | undefined): ReadingTime => {
  const charactors = getwords(body)
  const words = [...new Intl.Segmenter('zh-tw', { granularity: 'word' }).segment(charactors)].length
  const char = [...new Intl.Segmenter().segment(charactors)].length

  const minutes = Math.ceil(char / READ_PER_MIN)
  const time = minutes * 60 * 1000
  return {
    minutes,
    time,
    count: {
      words,
      char,
    },
  }
}

export default getReadingTime
