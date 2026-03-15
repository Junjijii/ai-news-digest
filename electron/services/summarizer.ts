import Anthropic from '@anthropic-ai/sdk'
import type { FetchedArticle } from './news-fetcher'
import type { NewsFeed, NewsItem } from '../../src/types/news'

export class Summarizer {
  private client: Anthropic

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey })
  }

  async summarizeFeed(articles: FetchedArticle[]): Promise<NewsFeed> {
    if (articles.length === 0) {
      return {
        date: new Date().toISOString().split('T')[0],
        fetchedAt: new Date().toISOString(),
        items: [],
        summary: 'ニュースが見つかりませんでした。',
      }
    }

    const articleTexts = articles.map((a, i) =>
      `[${i + 1}] ${a.source}: ${a.title}\n${a.description}`
    ).join('\n\n')

    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: `以下は世界のテックメディアから収集した最新のAI関連ニュースです。これらを分析して、以下のJSON形式で出力してください。

要件:
1. 重複するニュースはまとめる
2. 各ニュースに日本語の要約をつける
3. カテゴリ分け（LLM, 画像生成, ロボティクス, 規制・政策, ビジネス, 研究, その他）
4. 全体のサマリーを日本語で作成
5. 重要度順にソート

ニュース一覧:
${articleTexts}

以下のJSON形式で出力（JSONのみ、他のテキストなし）:
{
  "items": [
    {
      "index": 1,
      "summary": "日本語の要約",
      "category": "カテゴリ名"
    }
  ],
  "overallSummary": "今日のAIニュース全体の要約（3-5文）"
}`,
      }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Claude APIからの応答を解析できませんでした')
    }

    const parsed = JSON.parse(jsonMatch[0])

    const items: NewsItem[] = parsed.items.map((item: any) => {
      const article = articles[item.index - 1]
      if (!article) return null
      return {
        id: article.id,
        author: article.source,
        authorHandle: article.source,
        text: article.description,
        summary: item.summary,
        url: article.url,
        postedAt: article.postedAt,
        likes: 0,
        retweets: 0,
        category: item.category,
      }
    }).filter(Boolean)

    return {
      date: new Date().toISOString().split('T')[0],
      fetchedAt: new Date().toISOString(),
      items,
      summary: parsed.overallSummary,
    }
  }
}
