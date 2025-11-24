export interface IAuthForm {
    login: string
    password: string
}

export interface IUser {
    id: number
    name? : string
}

export interface IAuthResponse {
    accessToken: string
    user: IUser
}