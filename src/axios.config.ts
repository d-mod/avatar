/***
 @author kritsu
 @date 2019/10/9 14:27
 **/
import axios from "axios"
import qs from "qs"

axios.$get = async function (url, config) {
    const response = await axios.get(url, config)
    return response.data
}

axios.$post = async function (url, config) {
    const response = await axios.post(url, config)
    return response.data
}

axios.$delete = async function (url, config) {
    const response = await axios.delete(url, config)
    return response.data
}

axios.defaults.baseURL = "/api"

if (axios.defaults.headers) {
    axios.defaults.headers["Content-Type"] = "application/x-www-form-urlencoded"
}

axios.interceptors.request.use(
    config => {
        if (config.method === "post" && (!config.headers || !config.headers["Content-Type"])) {
            config.data = qs.stringify(config.data)
        }
        return config
    },
    async error => new Error(error.response.data.message || error.message)
)
