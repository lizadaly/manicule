#!/usr/bin/env node

import fs from 'fs'
import path from 'path'

import {
  chromium
} from 'playwright'

if (process.argv.length < 3) {
  console.error('Pass the path to a VisCol collation file, e.g. data/1234/1234.json')
  process.exit(-1)
}
const collation = process.argv[2]
const data = JSON.parse(fs.readFileSync(collation, 'utf-8'))
const dest = path.join(path.dirname(collation), 'images')
fs.mkdirSync(dest, {
  recursive: true
})

const pages = {}

// Create a lookup table of all the image IDs
for (const [page, metadata] of Object.entries(data.Rectos)) {
  pages[metadata.params.image.url] = { side: 'r', page, leaf: metadata.parentOrder }
}
for (const [page, metadata] of Object.entries(data.Versos)) {
  pages[metadata.params.image.url] = { side: 'v', page, leaf: metadata.parentOrder }
}

for (const manifest of Object.values(data.project.manifests)) {
  const {
    url
  } = manifest
  downloadImages(url, dest)
}

async function downloadImages (manifest, dest) {
  const browser = await chromium.launch()
  const context = await browser.newContext()

  const page = await context.newPage()
  const promise = page.waitForResponse(() => true)
  await page.goto(manifest)

  const resp = await promise
  const content = await resp.json()

  for (const canvas of content.sequences[0].canvases) {
    const {
      images
    } = canvas
    if (images.length > 0) {
      const imageId = images[0].resource.service['@id']
      const base = new URL(imageId)
      const {
        pathname
      } = base
      const filename = pathname.split('/')[pathname.split('/').length - 1]
      const url = `${base}/full/full/0/default.jpg`
      const imageResp = await page.goto(url)
      const image = await imageResp.body()
      let outfile = filename
      if (imageId in pages) {
        outfile = `leaf${pages[base].leaf}-${pages[base].side}${pages[base].page}.jpg`
      }
      const file = path.join(dest, outfile)
      console.log(`Writing ${file}...`)
      fs.writeFile(file, image, (err) => {
        if (err) throw err
      })
    }
  }

  await context.close()
  await browser.close()
}
