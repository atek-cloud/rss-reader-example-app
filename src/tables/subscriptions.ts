import { defineTable } from '@atek-cloud/adb-api'

interface Subscription {
  feedUrl: string
  title: string
  description: string
  link: string
}

export default defineTable<Subscription>('atrss.atek.cloud/subscription', {
  revision: 2,
  definition: {
    type: 'object',
    properties: {
      feedUrl: {type: 'string'},
      title: {type: 'string'},
      description: {type: 'string'},
      link: {type: 'string'}
    }
  },
  templates: {
    table: {
      title: 'RSS Feed Subscription',
      description: 'An RSS source'
    },
    record: {
      title: '{{/title}} ({{/feedUrl}})'
    }
  }
})