export interface NewsItem {
  id: string
  author: string
  authorHandle: string
  text: string
  summary: string
  url: string
  postedAt: string
  likes: number
  retweets: number
  category: string
}

export interface NewsFeed {
  date: string
  fetchedAt: string
  items: NewsItem[]
  summary: string
}

export interface AppSettings {
  xBearerToken: string
  anthropicApiKey: string
  scheduleHour: number
  scheduleMinute: number
  searchQueries: string[]
  maxResults: number
  language: 'ja' | 'en' | 'all'
}
