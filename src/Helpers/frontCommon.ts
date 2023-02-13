export const request = async (url: string, options: RequestInit) => (
    await fetch(url, options)
            .then(res => res.json())
            .catch(err => console.log(err))
)

export const _handleSubmit = (evt: React.FormEvent<HTMLFormElement>, url: string) => {
    evt.preventDefault()
    let body = Object.fromEntries(new FormData(evt.currentTarget))

    return new Promise((resolve, reject) => {
        request(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })
            .then(res => resolve(res),)
            .catch(err => reject(err))
    })
}
