import { resolve } from 'node:path'
import { Buffer } from 'node:buffer'
import fg from 'fast-glob'
import fs from 'fs-extra'
import fm from 'front-matter'
import consola from 'consola'
import { parseFrontMatter } from 'remark-mdc'

import sharp from 'sharp'
import type { MyCustomParsedContent as BlogPost } from '~/types/query'

const ogSVg = fs.readFileSync('./scripts/og-template.svg', 'utf-8')

function strSlice(str: string, num = 22) {
  const { length: len } = str
  const result: string[] = []
  const time = Math.ceil(len / num)
  for (let i = 0; i < time; i++) {
    const piece = str.slice(i * num, (i + 1) * num)
    result.push(piece)
  }

  return result
}

async function generateSVG(meta: BlogPost, output: string) {
  const slicedTitle = strSlice(meta?.title ?? '')

  const slicedDescription = strSlice(meta?.description ?? '', 50)
  const data = {
    title: slicedTitle[0] ?? '',
    title2: slicedTitle[1] ?? '',
    description: slicedDescription[0] ?? '',
    description2: slicedDescription[1] ?? '',
    description3: slicedDescription[2] ?? '',
  }

  const svg = ogSVg.replace(/\{\{([^}]+)}}/g, (_, name: keyof typeof data) => data[name])

  await sharp(Buffer.from(svg))
    .resize(1200 * 1.1, 630 * 1.1)
    .png()
    .toFile(output)
}

const DIST_PATH = resolve(__dirname, '../public/og-images')
const POSTS_PATH = ['content/1.notes/**/*.md', 'content/2.thinks/**/*.md', 'content/index.md']

async function getAllPostMeta() {
  const postsPaths = await Promise.all(POSTS_PATH.map(async p => await fg(p))).then(res => res.flat())
  const postsFrontMatterPromises = postsPaths.map(async p =>
    await fs.readFile(p, 'utf-8')
      .then((c) => {
        const frontmatter = fm(c).frontmatter
        if (!frontmatter)
          return null
        const { data } = parseFrontMatter(`---\n${frontmatter}\n---`)
        return data
      }),
  )

  const posts = await Promise.all(postsFrontMatterPromises)

  return posts.filter(i => !!i) as BlogPost[]
}

export async function main() {
  const postsMeta = await getAllPostMeta()
  fs.rmSync(DIST_PATH, { recursive: true, force: true })
  fs.mkdirSync(DIST_PATH)

  await Promise.all(postsMeta.map(async (meta) => {
    if (meta?.title) {
      const fileName = `${DIST_PATH}/og-${meta?.title ?? ''}.png`

      await fs.writeFile(fileName, '')

      await generateSVG(meta, fileName)
    }
  }))
}

consola.info('Start to run og:image build process')

main().then(() => {
  consola.success('og:image Build Success !!')
}).catch((err) => {
  consola.error('[svg-generate Error: ]', err)
})
