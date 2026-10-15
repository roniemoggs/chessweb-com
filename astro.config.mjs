// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap, { ChangeFreqEnum } from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://チェスweb.com',
  integrations: [
    react(),
    sitemap({
      filter: (page) =>
        !page.includes('/404') &&
        !page.includes('/500') &&
        !page.includes('/rules'),
      serialize(item) {
        const url = new URL(item.url);
        if (url.pathname === '/' || url.pathname === '/en/') {
          item.priority = 1.0;
          item.changefreq = ChangeFreqEnum.DAILY;
        } else if (url.pathname.includes('/online')) {
          item.priority = 0.9;
          item.changefreq = ChangeFreqEnum.WEEKLY;
        } else if (url.pathname.includes('/learn')) {
          item.priority = 0.8;
          item.changefreq = ChangeFreqEnum.WEEKLY;
        } else {
          item.priority = 0.6;
          item.changefreq = ChangeFreqEnum.MONTHLY;
        }
        item.lastmod = new Date().toISOString();
        return item;
      },
      i18n: {
        defaultLocale: 'ja',
        locales: {
          ja: 'ja',
          en: 'en',
        },
      },
    }),
    {
      name: 'sitemap-dev-and-alias',
      hooks: {
        'astro:build:done': async ({ dir }) => {
          const { copyFile } = await import('node:fs/promises');
          const { fileURLToPath } = await import('node:url');
          try {
            const sitemapIndex = fileURLToPath(new URL('sitemap-index.xml', dir));
            const sitemapAlias = fileURLToPath(new URL('sitemap.xml', dir));
            await copyFile(sitemapIndex, sitemapAlias);
          } catch (err) {
            console.warn('Could not copy sitemap-index.xml to sitemap.xml', err);
          }
        },
        'astro:server:setup': ({ server }) => {
          server.middlewares.use(async (req, res, next) => {
            const cleanUrl = req.url?.split('?')[0];
            if (cleanUrl === '/sitemap.xml' || cleanUrl === '/sitemap-index.xml' || cleanUrl === '/sitemap-0.xml') {
              const { readFile } = await import('node:fs/promises');
              const { resolve } = await import('node:path');
              const filename = cleanUrl === '/sitemap.xml' ? 'sitemap.xml' : cleanUrl.slice(1);
              const filePath = resolve(process.cwd(), 'dist', filename);
              try {
                const xml = await readFile(filePath, 'utf-8');
                res.setHeader('Content-Type', 'application/xml; charset=utf-8');
                res.end(xml);
                return;
              } catch {
                // If dist file doesn't exist yet, proceed
              }
            }
            next();
          });
        },
      },
    },
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      dedupe: ['react', 'react-dom'],
    },
    optimizeDeps: {
      include: ['chess.js', 'react-chessboard', 'lucide-react', 'qrcode'],
    },
  },
  i18n: {
    defaultLocale: 'ja',
    locales: ['ja', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
