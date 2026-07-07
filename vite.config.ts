import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

function readJsonBody(req: import('http').IncomingMessage): Promise<any> {
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

      server.middlewares.use('/api/categorize', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end()
          return
        }
        try {
          const { categorizeBatch } = await import('./api/_shared/categorize.ts')
          const body = await readJsonBody(req)
          const results = await categorizeBatch(body?.transactions ?? [])
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ results }))
        } catch (err) {
          console.error('[api/categorize]', err)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'categorization_failed' }))
        }
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
