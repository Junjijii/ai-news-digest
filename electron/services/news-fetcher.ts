import https from 'https'
import http from 'http'

export interface FetchedArticle {
  id: string
  title: string
  description: string
  source: string
  url: string
  postedAt: string
}

// 無料で使えるAIニュースRSSフィード
const RSS_FEEDS = [
  { name: 'MIT Tech Review AI', url: 'https://www.technologyreview.com/feed/' },
  { name: 'VentureBeat AI', url: 'https://venturebeat.com/category/ai/feed/' },
  { name: 'The Verge AI', url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml' },
  { name: 'Ars Technica AI', url: 'https://feeds.arstechnica.com/arstechnica/technology-lab' },
  { name: 'TechCrunch AI', url: 'https://techcrunch.com/category/artificial-intelligence/feed/' },
]

export class NewsFetcher {
  async fetchAINews(maxResults: number): Promise<FetchedArticle[]> {
    const allArticles: FetchedArticle[] = []

    for (const feed of RSS_FEEDS) {
      try {
        const articles = await this.fetchRSS(feed.url, feed.name)
        allArticles.push(...articles)
      } catch (err: any) {
        console.error(`[NewsFetcher] RSS fetch failed: ${feed.name}`, err.message)
      }
    }

    // Deduplicate by title similarity, sort by date
    const seen = new Set<string>()
    const deduped = allArticles.filter((a) => {
      const key = a.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 40)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    deduped.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime())

    // Filter to AI-related articles
    const aiKeywords = /\b(ai|artificial intelligence|llm|gpt|claude|gemini|openai|anthropic|machine learning|deep learning|neural|transformer|chatbot|generative|diffusion|robot|agi)\b/i
    const filtered = deduped.filter((a) =>
      aiKeywords.test(a.title) || aiKeywords.test(a.description)
    )

    return (filtered.length > 0 ? filtered : deduped).slice(0, maxResults)
  }

  private fetchRSS(feedUrl: string, sourceName: string): Promise<FetchedArticle[]> {
    return new Promise((resolve, reject) => {
      const client = feedUrl.startsWith('https') ? https : http
      const req = client.get(feedUrl, {
        headers: { 'User-Agent': 'AI-News-Digest/1.0' },
        timeout: 10000,
      }, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          this.fetchRSS(res.headers.location, sourceName).then(resolve).catch(reject)
          return
        }
        let data = ''
        res.on('data', (chunk) => { data += chunk })
        res.on('end', () => {
          try {
            const articles = this.parseRSS(data, sourceName)
            resolve(articles)
          } catch (e) {
            reject(e)
          }
        })
      })
      req.on('error', reject)
      req.on('timeout', () => { req.destroy(); reject(new Error('timeout')) })
    })
  }

  private parseRSS(xml: string, sourceName: string): FetchedArticle[] {
    const articles: FetchedArticle[] = []

    // Parse <item> (RSS 2.0) or <entry> (Atom)
    const itemRegex = /<item[\s>]([\s\S]*?)<\/item>|<entry[\s>]([\s\S]*?)<\/entry>/g
    let match

    while ((match = itemRegex.exec(xml)) !== null) {
      const block = match[1] || match[2]

      const title = this.extractTag(block, 'title')
      const description = this.extractTag(block, 'description') || this.extractTag(block, 'summary') || this.extractTag(block, 'content')
      const link = this.extractLink(block)
      const pubDate = this.extractTag(block, 'pubDate') || this.extractTag(block, 'published') || this.extractTag(block, 'updated')
      const guid = this.extractTag(block, 'guid') || this.extractTag(block, 'id') || link

      if (title) {
        articles.push({
          id: guid || `${sourceName}-${articles.length}`,
          title: this.stripHtml(title).trim(),
          description: this.stripHtml(description || '').trim().slice(0, 500),
          source: sourceName,
          url: link || '',
          postedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        })
      }
    }

    return articles
  }

  private extractTag(block: string, tag: string): string {
    // Handle CDATA
    const cdataRegex = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`, 'i')
    const cdataMatch = block.match(cdataRegex)
    if (cdataMatch) return cdataMatch[1]

    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i')
    const m = block.match(regex)
    return m ? m[1] : ''
  }

  private extractLink(block: string): string {
    // RSS <link>
    const linkMatch = block.match(/<link[^>]*>([^<]+)<\/link>/i)
    if (linkMatch) return linkMatch[1].trim()
    // Atom <link href="...">
    const atomMatch = block.match(/<link[^>]*href=["']([^"']+)["'][^>]*\/?>/i)
    if (atomMatch) return atomMatch[1]
    return ''
  }

  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .trim()
  }
}
