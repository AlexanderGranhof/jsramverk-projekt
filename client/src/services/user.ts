import apiFetch from './fetch'

export const create = (name: string, password: string) => {
    return apiFetch(`/user/register`, {
        name,
        password,
    })
}

export const login = (name: string, password: string) => {
    return apiFetch('/user/signin', {
        name,
        password,
    })
}

export const validate = async () => {
    const response = await apiFetch('/user/validate/cookie')
    const data = await response.json()

    return data.valid === true
}

export const logout = () => {
    return apiFetch('/user/signout', {})
}
