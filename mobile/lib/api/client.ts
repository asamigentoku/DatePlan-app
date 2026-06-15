import axios from 'axios';

axios.defaults.baseURL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api/v1';