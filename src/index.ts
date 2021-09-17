import createExpressApp, * as express from 'express'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { createRpcServer } from '@atek-cloud/node-rpc'
import Parser from 'rss-parser'
import adb from '@atek-cloud/adb-api'
import subscriptions from './tables/subscriptions.js'
import feedItems from './tables/feed-items.js'

const SOCKET = process.env.ATEK_ASSIGNED_SOCKET_FILE
const HERE_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

const maindb = adb.db('maindb', {displayName: 'atRSS data'})
subscriptions(maindb)
feedItems(maindb)

const rpcServer = createRpcServer({
  async addSource (url: string) {
    let feed
    try {
      feed = await getFeed(url)
    } catch (e: any) {
      throw new Error(`Failed to load feed: ${e.toString()}`)
    }
    
    try {
      const subRecord = await subscriptions(maindb).create({
        feedUrl: feed.feedUrl,
        title: feed.title,
        description: feed.description,
        link: feed.link
      })

      for (const item of feed.items) {
        await feedItems(maindb).create({
          subscriptionKey: subRecord.key,
          feedUrl: feed.feedUrl,
          creator: item.creator,
          title: item.title,
          link: item.link,
          pubDate: item.isoDate
        })
      }
    } catch (e) {
      console.log(e)
      throw e
    }
  },

  async removeSource (key: string) {
    const allItems = (await feedItems(maindb).list()).records
    for (const item of allItems) {
      if (item.value.subscriptionKey === key) {
        await feedItems(maindb).delete(item.key)
      }
    }
    await subscriptions(maindb).delete(key)
  },

  listSources () {
    return subscriptions(maindb).list()
  },

  async listAllFeed (opts: {offset: number, limit: number} = {offset: 0, limit: 30}) {
    const allItems = (await feedItems(maindb).list()).records
    allItems.sort((a: any, b: any) => b.value.pubDate.localeCompare(a.value.pubDate))
    if (opts.offset || opts.limit) {
      return allItems.slice(opts.offset, opts.offset + opts.limit)
    }
    return allItems
  },

  async deleteAll () {
    const allItems = (await feedItems(maindb).list()).records
    for (const item of allItems) {
      await feedItems(maindb).delete(item.key)
    }
  },
})

const app = createExpressApp()
app.use('/_api', express.json())
app.post('/_api', (req: express.Request, res: express.Response) => {
  rpcServer.handle(req, res, req.body)
})
app.use('/', express.static(path.join(HERE_PATH, 'static')))
app.listen(SOCKET, () => {
  console.log('atRSS listening on socket', SOCKET)
})

const parser = new Parser()
function getFeed (url: string) {
  return parser.parseURL(url)
}
