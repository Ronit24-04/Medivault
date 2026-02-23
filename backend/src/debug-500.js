const http = require('http');

const loginData = JSON.stringify({
    email: 'ronit@example.com',
    password: 'Password123!'
});

const loginOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
    }
};

const req = http.request(loginOptions, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        try {
            const data = JSON.parse(body);
            const token = data.data.accessToken;
            console.log('Token obtained.');

            fetchApi(token, '/api/patients');
            fetchApi(token, '/api/emergency/contacts');
        } catch (e) {
            console.error('Login failed response:', body);
        }
    });
});

req.on('error', (e) => console.error('Connection error:', e));
req.write(loginData);
req.end();

function fetchApi(token, path) {
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: path,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };

    const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
            console.log(`\nResponse from ${path}:`);
            console.log(body);
        });
    });
    req.on('error', (e) => console.error(`Error fetching ${path}:`, e));
    req.end();
}
