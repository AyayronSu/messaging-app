const API_URL = 'https://localhost:5000/api';

function setToken(token) {
    localStorage.setItem('token', token);
}

function getToken() {
    return localStorage.getItem('token');
}

async function fetchWithAuth(url, options = {}) {
    const token = getToken();
    options.headers = {
        ...options.headers,
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
    const res = await fetch(url, options);
    return res.json();
}

function requireAuth() {
    if (!getToken()) {
        window.location.href = 'index.html';
    }
}