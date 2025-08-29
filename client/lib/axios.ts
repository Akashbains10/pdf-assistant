import Axios, { type InternalAxiosRequestConfig } from "axios";

const API_URL = process.env.NEXT_PUBLIC_BASE_URL;

function authRequestInterceptor(config: InternalAxiosRequestConfig) {
  if (config && config.headers) {
    config.headers.Accept = "application/json";
  }
  return config;
}

export const axios = Axios.create({
  baseURL: API_URL,
});

const errorCallBack = (error: any) => {
  const message = error.response?.data?.message || error.message;
  console.log('Error:',message)
  return Promise.reject(error);
};

axios.interceptors.request.use(authRequestInterceptor);
axios.interceptors.response.use((response) => {
  return response?.data;
}, errorCallBack);