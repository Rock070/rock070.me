import { resolve } from 'path'
import fg from 'fast-glob'
import fs from 'fs-extra'
import fm from 'front-matter'
import consola from 'consola'
import { parseFrontMatter } from 'remark-mdc'

import sharp from 'sharp'
import type { MyCustomParsedContent as BlogPost } from '~/types/query'

const ogSVg = fs.readFileSync('./scripts/og-template.svg', 'utf-8')

const strSlice = (str: string, num = 22) => {
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
    .resize(950 * 1.1, 500 * 1.1)
    .png()
    .toFile(output)
}

const DIST_PATH = resolve(__dirname, '../public')

const getAllPostMeta = async () => {
  const ALL_PATH = 'content/**/*.md'
  const posts = await fg(ALL_PATH).then(async (res) => {
    const p = res.map(async (p) => {
      return await fs.readFile(p, 'utf-8').then((c) => {
        const frontmatter = fm(c).frontmatter
        if (!frontmatter)
          return null
        const { data } = parseFrontMatter(`---\n${frontmatter}\n---`)
        return data
      })
    })

    return await Promise.all(p)
  })

  return posts.filter(i => !!i) as BlogPost[]
}

export async function main() {
  const postsMeta = await getAllPostMeta()

  await Promise.all(postsMeta.map(async (meta) => {
    const fileName = `${DIST_PATH}/og-${meta?.title ?? ''}.png`
    await fs.writeFile(fileName, '')

    await generateSVG(meta, fileName)
  }))
}

consola.info('Start to run og:image build process')

main().then(() => {
  consola.success('og:image Build Success !!')
}).catch((err) => {
  consola.error('[svg-generate Error: ]', err)
})
