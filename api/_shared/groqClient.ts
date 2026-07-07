import { EnvHttpProxyAgent } from 'undici'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

// Node's global fetch doesn't read HTTP_PROXY/HTTPS_PROXY on its own (unlike
// browsers). EnvHttpProxyAgent picks those up when present - e.g. behind a
// corporate proxy in local dev - and is a harmless passthrough when they're
// unset, like on Vercel.
const dispatcher = new EnvHttpProxyAgent()

interface GroqMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function callGroq(
  messages: GroqMessage[],
  opts: { model: string; temperature?: number; jsonMode?: boolean; timeoutMs?: number },
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY is not configured on the server')

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), opts.timeoutMs ?? 15000)

  try {
    const res = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: opts.model,
        messages,
        temperature: opts.temperature ?? 0.3,
        ...(opts.jsonMode ? { response_format: { type: 'json_object' } } : {}),
      }),
      signal: controller.signal,
      // @ts-expect-error - dispatcher is a Node/undici-specific fetch extension, not in the DOM lib types
      dispatcher,
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Groq API error ${res.status}: ${text}`)
    }

    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] }
    const content = data.choices?.[0]?.message?.content
    if (typeof content !== 'string') throw new Error('Groq response missing message content')
    return content
  } finally {
    clearTimeout(timeout)
  }
}
