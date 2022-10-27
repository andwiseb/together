import axios from 'axios';

export const createClient = (route: string, token?: string) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

    return axios.create({
        baseURL: import.meta.env.VITE_API_URL + route,
        headers
    });
};

export const handleHttpError = (error) => {
    // Check for Axios http error
    if (error.isAxiosError) {
        if (error.response) {
            // The request was made and the server responded with a
            return error.response.data;
        } else if (error.request) {
            // The request was made but no response was received
            return error.request;
        } else if (error.message) {
            // Something happened in setting up the request that triggered an Error
            return error.message;
        } else if (error.toJSON) {
            // Produces general information about the HTTP error
            return error.toJSON();
        }
    }

    // Not an Axios error
    return error;
}