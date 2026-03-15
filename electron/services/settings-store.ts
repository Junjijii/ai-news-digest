import Store from 'electron-store'
import type { AppSettings, NewsFeed } from '../../src/types/news'

const DEFAULT_SETTINGS: AppSettings = {
  xBearerToken: '',
  anthropicApiKey: '',
  scheduleHour: 6,
  scheduleMinute: 0,
  searchQueries: [
    'AI artificial intelligence -is:retweet',
    'LLM GPT Claude -is:retweet',
    'machine learning deep learning -is:retweet',
    'OpenAI Anthropic Google AI -is:retweet',
  ],
  maxResults: 50,
  language: 'all',
}

export class SettingsStore {
  private store: Store

  constructor() {
    this.store = new Store({ name: 'ai-news-digest' })
  }

  getAll(): AppSettings {
    return {
      xBearerToken: this.store.get('xBearerToken', DEFAULT_SETTINGS.xBearerToken) as string,
      anthropicApiKey: this.store.get('anthropicApiKey', DEFAULT_SETTINGS.anthropicApiKey) as string,
      scheduleHour: this.store.get('scheduleHour', DEFAULT_SETTINGS.scheduleHour) as number,
      scheduleMinute: this.store.get('scheduleMinute', DEFAULT_SETTINGS.scheduleMinute) as number,
      searchQueries: this.store.get('searchQueries', DEFAULT_SETTINGS.searchQueries) as string[],
      maxResults: this.store.get('maxResults', DEFAULT_SETTINGS.maxResults) as number,
      language: this.store.get('language', DEFAULT_SETTINGS.language) as 'ja' | 'en' | 'all',
    }
  }

  saveSettings(settings: Partial<AppSettings>) {
    for (const [key, value] of Object.entries(settings)) {
      this.store.set(key, value)
    }
  }

  getLatestFeed(): NewsFeed | null {
    return this.store.get('latestFeed', null) as NewsFeed | null
  }

  saveLatestFeed(feed: NewsFeed) {
    this.store.set('latestFeed', feed)
  }
}
