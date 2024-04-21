import axios from 'axios'
export async function getWithoutToken(url: string): Promise<any> {
    try {
        const response = await axios.get(url)
        return response
    } catch (error) {
        if (error instanceof Error) {
            console.error(error.message)
        } else {
            console.error("Failed to fetch data:", error)
        }
    }
}

export async function getWithToken(url: string, token: string): Promise<any> {
    try {
        const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` }})
        return response
    } catch (error) {
        if (error instanceof Error) {
            console.error(error.message)
        } else {
            console.error("Failed to fetch data:", error)
        }
    }
}

export async function postWithoutToken(url: string, data: any): Promise<any> {
    try {
        const response = await axios.post(url, data)
        return response
    } catch (error) {
        if (error instanceof Error) {
            console.error(error.message)
        } else {
            console.error("Failed to post data:", error)
        }
    }
}

export async function postWithToken(url: string, data: any, token: string): Promise<any> {
    try {
        const response = await axios.post(url, data, {
            headers: { Authorization: `Bearer ${token}` }})
        return response
    } catch (error) {
        if (error instanceof Error) {
            console.error(error.message)
        } else {
            console.error("Failed to post data:", error)
        }
    }
}

export async function deleteWithToken(url: string, token: string): Promise<any> {
    try {
        const response = await axios.delete(url, {
            headers: { Authorization: `Bearer ${token}` }})
        return response
    } catch (error) {
        if (error instanceof Error) {
            console.error(error.message)
        } else {
            console.error("Failed to delete data:", error)
        }
    }
}