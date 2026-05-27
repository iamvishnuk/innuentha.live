import axios from 'axios';
import { createClient } from '@innuentha/supabase/client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api';

const api = axios.create({
  baseURL: API_URL
});

api.interceptors.request.use(async (config) => {
  try {
    const supabase = createClient();
    const {
      data: { session }
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
  } catch (err) {
    console.error('Error fetching Supabase auth session in interceptor:', err);
  }
  return config;
});
