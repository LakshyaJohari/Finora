import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import type { IncomingMessage, ServerResponse } from 'http'

function readJsonBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', (chunk) => (raw += chunk))
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {})
      } catch (err) {
        reject(err)
      }
    })
  })
}

function jsonRoute(
  server: import('vite').ViteDevServer,
  path: string,
  handle: (body: any) => Promise<unknown>,
) {
  server.middlewares.use(path, async (req: IncomingMessage, res: ServerResponse) => {
    if (req.method !== 'POST') {
      res.statusCode = 405
      res.end()
      return
    }
    try {
      const body = await readJsonBody(req)
      const result = await handle(body)
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(result))
    } catch (err) {
      console.error(`[${path}]`, err)
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'request_failed' }))
    }
  })
}

/**
 * Mirrors the /api/*.ts Vercel serverless functions during local `vite dev`,
 * so LLM calls never happen from the browser (the API key stays server-side)
 * in dev the same way it does in production.
 */
function localApiRoutes(env: Record<string, string>): Plugin {
  return {
    name: 'local-api-routes',
    configureServer(server) {
      process.env.GROQ_API_KEY = env.GROQ_API_KEY
      // The dev server process doesn't inherit the shell's proxy env vars,
      // so thread them through explicitly (see api/_shared/groqClient.ts).
      if (env.HTTPS_PROXY) process.env.HTTPS_PROXY = env.HTTPS_PROXY
      if (env.HTTP_PROXY) process.env.HTTP_PROXY = env.HTTP_PROXY

      jsonRoute(server, '/api/categorize', async (body) => {
        const { categorizeBatch } = await import('./api/_shared/categorize.ts')
        const results = await categorizeBatch(body?.transactions ?? [])
        return { results }
      })

      jsonRoute(server, '/api/advisor', async (body) => {
        const { getAdvisorReply } = await import('./api/_shared/advisor.ts')
        const reply = await getAdvisorReply(String(body?.context ?? ''), body?.history ?? [], String(body?.message ?? ''))
        return { reply }
      })

      jsonRoute(server, '/api/extract', async (body) => {
        const { extractTransactionsFromImage } = await import('./api/_shared/extract.ts')
        const today = String(body?.today ?? new Date().toISOString().slice(0, 10))
        const transactions = await extractTransactionsFromImage(String(body?.image ?? ''), today)
        return { transactions }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), localApiRoutes(env)],
  }
})
