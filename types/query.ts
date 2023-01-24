import type { MarkdownParsedContent } from '@nuxt/content/dist/runtime/types'

export interface MyCustomParsedContent extends MarkdownParsedContent {
  categories: string | string[]
  date?: string
  date_iso_string?: string
  date_format?: string
}
