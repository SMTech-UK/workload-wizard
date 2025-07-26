import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/inbox', '/login'],
      },
    ],
    sitemap: 'https://workload-wizard.com/sitemap.xml',
  }
} 