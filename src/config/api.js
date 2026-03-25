// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// API Endpoints
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/api/auth/login',
        ME: '/api/auth/me',
    },
    ADMIN: {
        DASHBOARD: '/api/admin/dashboard',
        FLATS: '/api/flats',
        MAINTENANCE: '/api/maintenance',
        COMPLAINTS: '/api/complaints',
        NOTICES: '/api/notices',
        VISITORS: '/api/visitors',
        REPORTS: '/api/reports',
    },
    RESIDENT: {
        DASHBOARD: '/api/resident/dashboard',
        COMPLAINTS: '/api/complaints',
        NOTICES: '/api/notices',
        VISITORS: '/api/visitors',
        MAINTENANCE: '/api/maintenance/history',
    },
};

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
    return `${API_BASE_URL}${endpoint}`;
};

// Helper function to get auth headers
export const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
    };
};

// Helper function for authenticated API calls
export const apiCall = async (endpoint, options = {}) => {
    const url = getApiUrl(endpoint);
    const headers = getAuthHeaders();

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                ...headers,
                ...options.headers,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error('API call error:', error);
        throw error;
    }
};
