// Convert Form Data to JSON
export const _handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    return Object.fromEntries(new FormData(e.currentTarget))
}

//Network Requests
export const request = async (url: string, options: RequestInit = {}) => {
    let req = await fetch('/api/' + url, options)
    let data = await req.json()

    if (req.ok)
        return data

    throw new Error(data.error)
}

export const post_or_put_data = async (url: string, body: any, post=true) => {
    let req = await request(url, {
        method: post ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })

    return req
}
