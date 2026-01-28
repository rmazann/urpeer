import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://urpeer.com'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteUrl}/feedback`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/roadmap`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/changelog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${siteUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]

  // Dynamic pages - Published changelog entries
  let changelogPages: MetadataRoute.Sitemap = []
  try {
    const supabase = await createClient()
    const { data: changelogs } = await supabase
      .from('changelog_entries')
      .select('id, updated_at')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .limit(100)

    if (changelogs) {
      changelogPages = changelogs.map((entry) => ({
        url: `${siteUrl}/changelog/${entry.id}`,
        lastModified: entry.updated_at ? new Date(entry.updated_at) : new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }))
    }
  } catch {
    // Silently fail for sitemap generation
  }

  // Dynamic pages - Public feedback
  let feedbackPages: MetadataRoute.Sitemap = []
  try {
    const supabase = await createClient()
    const { data: feedbacks } = await supabase
      .from('feedback')
      .select('id, updated_at')
      .order('vote_count', { ascending: false })
      .limit(100)

    if (feedbacks) {
      feedbackPages = feedbacks.map((item) => ({
        url: `${siteUrl}/feedback/${item.id}`,
        lastModified: item.updated_at ? new Date(item.updated_at) : new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.5,
      }))
    }
  } catch {
    // Silently fail for sitemap generation
  }

  return [...staticPages, ...changelogPages, ...feedbackPages]
}
