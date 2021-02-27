/***
 @author kritsu
 @date 2019/10/9 14:27
 **/
import axios from "axios"
import qs from "qs"

axios.defaults.baseURL = "/api"

axios.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded"

axios.interceptors.request.use((config) => {
        if (config.method === "post" && !config.headers["Content-Type"]) {
            config.data = qs.stringify(config.data)
        }
        return config
    },
    async error => await new Error(error.response.data.message || error.message)
)

axios.interceptors.response.use(response => response.data, error => Promise.reject(error))
