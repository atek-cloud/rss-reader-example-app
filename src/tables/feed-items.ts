import { defineTable } from '@atek-cloud/adb-api'

interface FeedItem {
  subscriptionKey: string
  feedUrl?: string
  creator?: string
  title?: string
  link?: string
  pubDate?: string
}

export default defineTable<FeedItem>('atrss.atek.cloud/feed-item', {
  revision: 2,
  definition: {
    type: 'object',
    properties: {
      subscriptionKey: {type: 'string'},
      feedUrl: {type: 'string'},
      creator: {type: 'string'},
      title: {type: 'string'},
      link: {type: 'string'},
      pubDate: {type: 'string', format: 'date-time'}
    },
    required: ['subscriptionKey']
  },
  templates: {
    table: {
      title: 'RSS Feed Items',
      description: 'Individual stories fetched from RSS feeds'
    },
    record: {
      title: '{{/title}}'
    }
  }
})
