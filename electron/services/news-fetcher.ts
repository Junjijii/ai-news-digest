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

// AIインフルエンサー・キーパーソンのXアカウント
const AI_INFLUENCERS = [
  { handle: 'sama', name: 'Sam Altman' },
  { handle: 'DarioAmodei', name: 'Dario Amodei' },
  { handle: 'elonmusk', name: 'Elon Musk' },
  { handle: 'demaboraoh', name: 'Demis Hassabis' },  // DeepMind
  { handle: 'kaboraoh', name: 'Andrej Karpathy' },
  { handle: 'ylecun', name: 'Yann LeCun' },
  { handle: 'iaboraoh', name: 'Ilya Sutskever' },
  { handle: 'AndrewYNg', name: 'Andrew Ng' },
  { handle: 'OpenAI', name: 'OpenAI' },
  { handle: 'AnthropicAI', name: 'Anthropic' },
  { handle: 'GoogleDeepMind', name: 'Google DeepMind' },
  { handle: 'xaboraoh', name: 'xAI' },
  { handle: 'MetaAI', name: 'Meta AI' },
  { handle: 'hardmaru', name: 'hardmaru (David Ha)' },
  { handle: 'emaboraoh', name: 'Emad Mostaque' },
  { handle: 'kaboraoh', name: 'Jim Fan (NVIDIA)' },
  { handle: 'DrJimFan', name: 'Jim Fan' },
  { handle: 'bindureddy', name: 'Bindu Reddy' },
  { handle: 'AravSrinivas', name: 'Arav Srinivas (Perplexity)' },
  { handle: 'svpino', name: 'Santiago (ML)' },
  // AI研究者
  { handle: 'GaryMarcus', name: 'Gary Marcus' },
  { handle: 'jeffdean', name: 'Jeff Dean (Google)' },
  { handle: 'fcaboraoh', name: 'Fei-Fei Li' },
  { handle: 'goodfellow_ian', name: 'Ian Goodfellow' },
  { handle: 'huaboraoh', name: 'Hugging Face' },
  { handle: 'ClementDelangue', name: 'Clement Delangue (HF)' },
  { handle: '_jasonwei', name: 'Jason Wei (OpenAI)' },
  { handle: 'percyliang', name: 'Percy Liang (Stanford)' },
  // 中国AI
  { handle: 'deepaboraoh', name: 'DeepSeek' },
  { handle: 'zhaboraoh', name: 'Zhipu AI' },
  { handle: 'kaifuaboraoh', name: 'Kai-Fu Lee' },
  { handle: 'laboraoh', name: 'Alibaba DAMO' },
  { handle: 'baidu_research', name: 'Baidu Research' },
]

// RSSHub公開インスタンス（複数用意してフォールバック）
const RSSHUB_INSTANCES = [
  'https://rsshub.app',
  'https://rsshub.rssforever.com',
  'https://rsshub-instance.zeabur.app',
]

// 補助: テックニュースRSS（XのRSSが取れない場合のフォールバック）
const FALLBACK_RSS = [
  { name: 'MIT Tech Review AI', url: 'https://www.technologyreview.com/feed/' },
  { name: 'VentureBeat AI', url: 'https://venturebeat.com/category/ai/feed/' },
  { name: 'TechCrunch AI', url: 'https://techcrunch.com/category/artificial-intelligence/feed/' },
]

export class NewsFetcher {
  async fetchAINews(maxResults: number): Promise<FetchedArticle[]> {
    const allArticles: FetchedArticle[] = []

    // Xアカウントからの取得を並列実行
    const xPromises = AI_INFLUENCERS.map((account) =>
      this.fetchFromX(account.handle, account.name).catch((err) => {
        console.error(`[NewsFetcher] X fetch failed: @${account.handle}`, err.message)
        return [] as FetchedArticle[]
      })
    )
    const xResults = await Promise.all(xPromises)
    for (const articles of xResults) {
      allArticles.push(...articles)
    }

    // Xから十分な記事が取れなかった場合、フォールバックRSSも使う
    if (allArticles.length < 5) {
      console.log('[NewsFetcher] X articles insufficient, using fallback RSS')
      for (const feed of FALLBACK_RSS) {
        try {
          const articles = await this.fetchRSS(feed.url, feed.name)
          allArticles.push(...articles)
        } catch (err: any) {
          console.error(`[NewsFetcher] RSS fallback failed: ${feed.name}`, err.message)
        }
      }
    }

    // 24時間以内のみ
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
    const recent = allArticles.filter((a) => new Date(a.postedAt).getTime() > oneDayAgo)

    // 重複除去・日付順ソート
    const seen = new Set<string>()
    const deduped = recent.filter((a) => {
      const key = a.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 50)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    deduped.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime())
    return deduped.slice(0, maxResults)
  }

  private async fetchFromX(handle: string, name: string): Promise<FetchedArticle[]> {
    // RSSHubインスタンスを順に試す
    for (const instance of RSSHUB_INSTANCES) {
      try {
        const url = `${instance}/twitter/user/${handle}`
        const articles = await this.fetchRSS(url, `@${handle} (${name})`)
        if (articles.length > 0) return articles
      } catch {
        continue
      }
    }
    return []
  }

  private fetchRSS(feedUrl: string, sourceName: string): Promise<FetchedArticle[]> {
    return new Promise((resolve, reject) => {
      const client = feedUrl.startsWith('https') ? https : http
      const req = client.get(feedUrl, {
        headers: { 'User-Agent': 'AI-News-Digest/1.0' },
        timeout: 15000,
      }, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          this.fetchRSS(res.headers.location, sourceName).then(resolve).catch(reject)
          return
        }
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode}`))
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

    const itemRegex = /<item[\s>]([\s\S]*?)<\/item>|<entry[\s>]([\s\S]*?)<\/entry>/g
    let match

    while ((match = itemRegex.exec(xml)) !== null) {
      const block = match[1] || match[2]

      const title = this.extractTag(block, 'title')
      const description = this.extractTag(block, 'description') || this.extractTag(block, 'summary') || this.extractTag(block, 'content')
      const link = this.extractLink(block)
      const pubDate = this.extractTag(block, 'pubDate') || this.extractTag(block, 'published') || this.extractTag(block, 'updated')
      const guid = this.extractTag(block, 'guid') || this.extractTag(block, 'id') || link

      if (title || description) {
        articles.push({
          id: guid || `${sourceName}-${articles.length}`,
          title: this.stripHtml(title || description).trim().slice(0, 300),
          description: this.stripHtml(description || title || '').trim().slice(0, 500),
          source: sourceName,
          url: link || '',
          postedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        })
      }
    }

    return articles
  }

  private extractTag(block: string, tag: string): string {
    const cdataRegex = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`, 'i')
    const cdataMatch = block.match(cdataRegex)
    if (cdataMatch) return cdataMatch[1]

    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i')
    const m = block.match(regex)
    return m ? m[1] : ''
  }

  private extractLink(block: string): string {
    const linkMatch = block.match(/<link[^>]*>([^<]+)<\/link>/i)
    if (linkMatch) return linkMatch[1].trim()
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
