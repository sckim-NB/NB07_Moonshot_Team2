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
  try {
    const accessToken = await getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
  } catch (e) {
    // 서버 전용 함수를 브라우저에서 호출할 때 발생하는 에러 방어
    console.warn('인증 토큰을 가져오는 중 경고 발생 (클라이언트 환경 가능성)');
  }
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      // 🚨 [핵심] 브라우저 환경에서만 리프레시를 시도하도록 제한합니다.
      // 서버 사이드(SSR)에서는 인터셉터를 통한 리프레시가 매우 복잡하고 위험합니다.
      if (typeof window === 'undefined') {
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      try {
        await refreshTokens();
        return axios(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
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
