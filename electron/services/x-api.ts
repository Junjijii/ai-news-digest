import https from 'https'

interface RawTweet {
  id: string
  text: string
  author_id: string
  created_at: string
  public_metrics: {
    like_count: number
    retweet_count: number
    reply_count: number
  }
}

interface TweetUser {
  id: string
  name: string
  username: string
}

export interface FetchedTweet {
  id: string
  text: string
  authorName: string
  authorHandle: string
  postedAt: string
  likes: number
  retweets: number
  url: string
}

export class XApiService {
  private bearerToken: string

  constructor(bearerToken: string) {
    this.bearerToken = bearerToken
  }

  async searchAINews(queries: string[], maxResults: number, language: string): Promise<FetchedTweet[]> {
    const allTweets: FetchedTweet[] = []
    const perQuery = Math.ceil(maxResults / queries.length)

    for (const query of queries) {
      try {
        const tweets = await this.searchRecent(query, Math.min(perQuery, 100), language)
        allTweets.push(...tweets)
      } catch (err: any) {
        console.error(`Query failed: ${query}`, err.message)
      }
    }

    // Deduplicate by ID
    const seen = new Set<string>()
    return allTweets.filter((t) => {
      if (seen.has(t.id)) return false
      seen.add(t.id)
      return true
    }).sort((a, b) => b.likes + b.retweets - (a.likes + a.retweets))
  }

  private searchRecent(query: string, maxResults: number, language: string): Promise<FetchedTweet[]> {
    const langParam = language !== 'all' ? ` lang:${language}` : ''
    const fullQuery = encodeURIComponent(query + langParam)
    const url = `https://api.x.com/2/tweets/search/recent?query=${fullQuery}&max_results=${Math.max(10, Math.min(maxResults, 100))}&tweet.fields=created_at,public_metrics,author_id&expansions=author_id&user.fields=name,username`

    return new Promise((resolve, reject) => {
      const req = https.request(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'Content-Type': 'application/json',
        },
      }, (res) => {
        let data = ''
        res.on('data', (chunk) => { data += chunk })
        res.on('end', () => {
          try {
            const json = JSON.parse(data)
            if (json.errors) {
              reject(new Error(json.errors[0]?.message || 'X API error'))
              return
            }
            if (!json.data) {
              resolve([])
              return
            }

            const users: TweetUser[] = json.includes?.users || []
            const userMap = new Map(users.map((u) => [u.id, u]))

            const tweets: FetchedTweet[] = json.data.map((t: RawTweet) => {
              const user = userMap.get(t.author_id)
              return {
                id: t.id,
                text: t.text,
                authorName: user?.name || 'Unknown',
                authorHandle: user?.username || 'unknown',
                postedAt: t.created_at,
                likes: t.public_metrics?.like_count || 0,
                retweets: t.public_metrics?.retweet_count || 0,
                url: `https://x.com/${user?.username || 'i'}/status/${t.id}`,
              }
            })
            resolve(tweets)
          } catch (e) {
            reject(e)
          }
        })
      })
      req.on('error', reject)
      req.end()
    })
  }
}
