import axios from 'axios';
import { getDatePlanAPI } from './petstore';

axios.defaults.baseURL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api/v1';

export const api = getDatePlanAPI();