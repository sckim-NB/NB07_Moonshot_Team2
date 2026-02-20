import * as Axios from 'axios';
import { getAccessToken, refreshTokens } from './auth';
// 서버 사이드인지 브라우저 사이드인지 체크
const isServer = typeof window === 'undefined';
// 서버라면 백엔드 실제 주소(3000)를 직접 찌르고, 브라우저라면 프록시(/api)를 탑니다.
const BASE_URL = isServer ? 'http://127.0.0.1:3000/api' : '/api';
//= process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const axios = Axios.default.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

axios.interceptors.request.use(async (config) => {
  const accessToken = await getAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // [수정] error.response가 있는지 '반드시' 먼저 확인합니다.
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await refreshTokens();
        return axios(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    // response가 아예 없는 네트워크 에러 등의 경우 처리
    if (!error.response) {
      console.error('네트워크 에러 또는 서버 응답 없음');
    }

    return Promise.reject(error);
  }
);
// axios.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;
//     if (error.response.status === 401 && !originalRequest) {
//       await refreshTokens();
//       return axios(originalRequest);
//     }
//     return Promise.reject(error);
//   }
// );
