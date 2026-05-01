import axios from 'axios';
import Conf from 'conf';

const config = new Conf({ projectName: 'oqens-cli' });

const API_BASE = process.env.OQENS_API_URL || 'https://oqens.me/api';

const api = axios.create({
    baseURL: API_BASE,
});

api.interceptors.request.use((req) => {
    const token = config.get('token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export { api, config };
