export function request(input: RequestInfo, init?: RequestInit) {
	if (import.meta.env.DEV) {
		return fetch(`http://localhost:3000${input instanceof Request ? input.url : input}`, init)
	}
	return fetch(input, init)
}
