import Store from 'electron-store'
import type { AppSettings, NewsFeed } from '../../src/types/news'

const DEFAULT_SETTINGS: AppSettings = {
  anthropicApiKey: '',
  scheduleHour: 6,
  scheduleMinute: 0,
  maxResults: 30,
}

export class SettingsStore {
  private store: Store

  constructor() {
    this.store = new Store({ name: 'ai-news-digest' })
  }

  getAll(): AppSettings {
    return {
      anthropicApiKey: this.store.get('anthropicApiKey', DEFAULT_SETTINGS.anthropicApiKey) as string,
      scheduleHour: this.store.get('scheduleHour', DEFAULT_SETTINGS.scheduleHour) as number,
      scheduleMinute: this.store.get('scheduleMinute', DEFAULT_SETTINGS.scheduleMinute) as number,
      maxResults: this.store.get('maxResults', DEFAULT_SETTINGS.maxResults) as number,
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
