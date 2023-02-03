export const request = async (url: string, options: any) => (
    await fetch(url, options)
            .then(res => res.json())
            .then(res => res.data)
            .catch(e => console.log(e))
)