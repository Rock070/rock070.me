import process from 'node:process'
import { SitemapStream, streamToPromise } from 'sitemap'
import { serverQueryContent } from '#content/server'

export default defineEventHandler(async (event) => {
  // Fetch all documents
  const docs = await serverQueryContent(event).find()
  const sitemap = new SitemapStream({
    hostname: process.env.NUXT_PUBLIC_BASE_URL,
  })

  for (const doc of docs) {
    if (doc._path?.startsWith('/drafts') || doc._type === 'yaml')
      continue

    sitemap.write({
      url: doc._path,
      changefreq: 'weekly',
    })
  }
  sitemap.end()

  return streamToPromise(sitemap)
})
