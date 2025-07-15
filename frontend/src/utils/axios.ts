import axios from 'axios'
import { BACKEND_URL } from '../config'

const api = axios.create({
    baseURL:BACKEND_URL,
    withCredentials:true,
    headers:{
        "Content-Type":"application-json"
    }
})
api.interceptors.request.use(
    (config)=>{
        const token = localStorage.getItem('accessToken')
        if(token){
            config.headers.Authorization=`Bearer ${token}`
        }
        return config
    },
    (error)=>Promise.reject(error)
)
api.interceptors.response.use(
    (response)=>response,
    async(error)=>{
        const originalRequest = error.config
        if(error.response?.status===401&&!originalRequest._retry){
            originalRequest._retry=true
            try {
                const refreshResponse = await axios.post(
                    `${BACKEND_URL}/auth/refresh`,
                    {},
                    {withCredentials:true}
                )
                const newToken = refreshResponse.data.accessToken
                localStorage.setItem('accessToken',newToken)

                originalRequest.headers.Authorization = `Bearer ${newToken}`
                return api(originalRequest)
            } catch (error) {
                localStorage.removeItem('accessToken')
                window.location.href="/signin"
                return Promise.reject(error)
            }
        }
        return Promise.reject(error)
    }
)
export default api