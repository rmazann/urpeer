import { getChangelogForRSS } from '@/features/changelog/actions/get-changelog'

export async function GET() {
  const entries = await getChangelogForRSS()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://urpeer.com'

  const rssItems = entries
    .map((entry) => {
      const pubDate = entry.published_at || entry.created_at
      const dateStr = pubDate ? new Date(pubDate).toUTCString() : new Date().toUTCString()

      return `
    <item>
      <title><![CDATA[${entry.title}]]></title>
      <link>${siteUrl}/changelog/${entry.id}</link>
      <guid isPermaLink="true">${siteUrl}/changelog/${entry.id}</guid>
      <description><![CDATA[${entry.content.slice(0, 500)}${entry.content.length > 500 ? '...' : ''}]]></description>
      <pubDate>${dateStr}</pubDate>
      <category>${entry.category}</category>
      <author>${entry.profiles?.full_name || 'Team'}</author>
    </item>`
    })
    .join('')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Urpeer Changelog</title>
    <link>${siteUrl}/changelog</link>
    <description>Stay up to date with the latest product updates from Urpeer.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/api/changelog/rss" rel="self" type="application/rss+xml"/>
    ${rssItems}
  </channel>
</rss>`

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
