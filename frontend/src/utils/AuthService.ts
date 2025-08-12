import { jwtDecode } from 'jwt-decode'
import {IUserTokenPayload} from '../types'
export class AuthService{
    private static readonly ACCESS_TOKEN_KEY ='accessToken'
    static getJsonAccessData():IUserTokenPayload{
        console.log("getting called")
            const token  = localStorage.getItem(this.ACCESS_TOKEN_KEY)
            
            if(!token) return null
            const decoded = jwtDecode<IUserTokenPayload>(token)
            console.log("decoded",decoded)
            if(decoded.exp&&decoded.exp<Date.now()/1000){
                localStorage.removeItem(this.ACCESS_TOKEN_KEY)
                // fetch("localhost://8787/api/v1/user/logout"
            }
            return decoded
    }
}