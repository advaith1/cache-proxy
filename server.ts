import { baseURL, refetchProbability, port } from './config.ts'

interface CachedResponse {
	body: string
	contentType: string
}

const cache: Record<string, CachedResponse> = {}

const fetchOrigin = async (path: string) => {
	const res = await fetch(baseURL + path)
	const data = {
		body: await res.text(),
		contentType: res.headers.get('content-type') ?? ''
	}
	if (res.ok) cache[path] = data
	return data
}

Deno.serve({ port }, async (req) => {
	const path = new URL(req.url).pathname
	let data = cache[path]
	if (!data) {
		data = await fetchOrigin(path)
	} else if (Math.random() < refetchProbability) {
		fetchOrigin(path) // asynchronously update cache
	}
	return new Response(data.body, { headers: { 'content-type': data.contentType } })
})
