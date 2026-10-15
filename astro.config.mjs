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
          // In-memory queue for local dev matchmaking simulation
          const devMatchQueue = new Map();
          function generateRoomCode() {
            const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
            let res = '';
            for (let i = 0; i < 6; i++) res += chars.charAt(Math.floor(Math.random() * chars.length));
            return res;
          }
          function pruneDevQueue() {
            const now = Date.now();
            for (const [id, t] of devMatchQueue.entries()) {
              if (now - t.lastSeenAt > 25000 || t.status === 'cancelled') {
                devMatchQueue.delete(id);
              }
            }
          }

          server.middlewares.use(async (req, res, next) => {
            const cleanUrl = req.url?.split('?')[0];

            // Local dev matchmaker endpoint
            if (cleanUrl === '/api/matchmake' && req.method === 'POST') {
              let bodyStr = '';
              req.on('data', (chunk) => { bodyStr += chunk; });
              req.on('end', () => {
                try {
                  const body = JSON.parse(bodyStr || '{}');
                  const action = body.action;
                  const playerId = body.playerId || 'anon';
                  const now = Date.now();
                  pruneDevQueue();

                  res.setHeader('Content-Type', 'application/json');

                  if (action === 'join') {
                    const timeControl = body.timeControl || 'any';
                    let matchedTicket = null;

                    for (const ticket of devMatchQueue.values()) {
                      if (
                        ticket.status === 'waiting' &&
                        ticket.playerId !== playerId &&
                        (now - ticket.lastSeenAt < 20000)
                      ) {
                        const isTcCompatible =
                          ticket.timeControl === 'any' ||
                          timeControl === 'any' ||
                          ticket.timeControl === timeControl;

                        if (isTcCompatible) {
                          matchedTicket = ticket;
                          break;
                        }
                      }
                    }

                    if (matchedTicket) {
                      const resolvedTc =
                        matchedTicket.timeControl !== 'any'
                          ? matchedTicket.timeControl
                          : timeControl !== 'any'
                          ? timeControl
                          : '5+0';
                      const roomCode = generateRoomCode();
                      const waitingIsWhite = Math.random() < 0.5;

                      matchedTicket.status = 'matched';
                      matchedTicket.matchData = {
                        roomCode,
                        role: 'host',
                        mySide: waitingIsWhite ? 'w' : 'b',
                        timeControl: resolvedTc,
                      };

                      res.end(JSON.stringify({
                        status: 'matched',
                        matchData: {
                          roomCode,
                          role: 'guest',
                          mySide: waitingIsWhite ? 'b' : 'w',
                          timeControl: resolvedTc,
                        },
                      }));
                      return;
                    }

                    const ticketId = 't_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
                    devMatchQueue.set(ticketId, {
                      ticketId,
                      playerId,
                      timeControl,
                      createdAt: now,
                      lastSeenAt: now,
                      status: 'waiting',
                    });

                    res.end(JSON.stringify({
                      status: 'waiting',
                      ticketId,
                      queueSize: devMatchQueue.size,
                    }));
                    return;
                  }

                  if (action === 'poll') {
                    const ticketId = body.ticketId;
                    if (!ticketId || !devMatchQueue.has(ticketId)) {
                      res.end(JSON.stringify({ status: 'expired' }));
                      return;
                    }

                    const ticket = devMatchQueue.get(ticketId);
                    if (ticket.status === 'matched' && ticket.matchData) {
                      const matchData = ticket.matchData;
                      devMatchQueue.delete(ticketId);
                      res.end(JSON.stringify({ status: 'matched', matchData }));
                      return;
                    }

                    if (ticket.status === 'waiting') {
                      ticket.lastSeenAt = now;
                      res.end(JSON.stringify({
                        status: 'waiting',
                        ticketId,
                        elapsedSeconds: Math.floor((now - ticket.createdAt) / 1000),
                      }));
                      return;
                    }

                    res.end(JSON.stringify({ status: 'expired' }));
                    return;
                  }

                  if (action === 'cancel') {
                    const ticketId = body.ticketId;
                    if (ticketId && devMatchQueue.has(ticketId)) {
                      devMatchQueue.delete(ticketId);
                    }
                    res.end(JSON.stringify({ status: 'cancelled' }));
                    return;
                  }

                  res.statusCode = 400;
                  res.end(JSON.stringify({ status: 'error', message: 'Unknown action' }));
                } catch (err) {
                  res.statusCode = 500;
                  res.end(JSON.stringify({ status: 'error', message: err?.message || 'Server error' }));
                }
              });
              return;
            }

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
      include: ['chess.js', 'react-chessboard', 'lucide-react', 'qrcode', 'peerjs'],
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
