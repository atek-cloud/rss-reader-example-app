import { create } from '/vendor/atek-browser-rpc.build.js'

const api = create('/_api')
window.api = api

const f = new Intl.DateTimeFormat('en', {day: 'numeric', month: 'short', year: 'numeric'})

class FeedElement extends HTMLElement {
  async connectedCallback () {
    const feedItems = await api.listAllFeed()
    this.innerHTML = `
      <div>
        ${feedItems.map(item => `
          <div class="feed-item">
            <div class="feed-item-link"><a href="${esc(item.value.link)}" target="_blank">${esc(item.value.title)}</a></div>
            <div class="feed-item-meta">
              Published on ${esc(f.format(new Date(item.value.pubDate)))} by ${esc(item.value.creator)}
              | Feed: <a href="${esc(item.value.feedUrl)}">${esc(item.value.feedUrl)}</a>
            </div>
          </div>
        `).join('\n')}
      </div>
    `
  }
}
customElements.define('app-feed', FeedElement)

class AddFeedElement extends HTMLElement {
  connectedCallback () {
    this.innerHTML = `
      <form>
        <input type="url" placeholder="Feed URL" name="url" required>
        <button type="submit">Add Feed</button>
      </form>
    `
    this.querySelector('form').addEventListener('submit', async e => {
      e.preventDefault()
      await api.addSource(e.target.url.value)
      window.location.reload()
    })
  }
}
customElements.define('app-add-feed', AddFeedElement)

function esc (str = '') {
  str = str.toString()
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
