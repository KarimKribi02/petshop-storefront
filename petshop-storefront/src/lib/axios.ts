import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Interceptor for logging & graceful error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Provide clean error message
    const message =
      error.response?.data?.message ||
      error.message ||
      'Une erreur de communication est survenue.';
    return Promise.reject(new Error(message));
  }
);

/**
 * Formats image URLs whether they are absolute URLs, storage paths or base64
 */
export function getMediaUrl(path?: string | null): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }
  const cleanBase = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000').replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // If path already starts with /storage/
  if (cleanPath.startsWith('/storage/')) {
    return `${cleanBase}${cleanPath}`;
  }
  return `${cleanBase}/storage/${path.replace(/^\//, '')}`;
}

export default apiClient;
