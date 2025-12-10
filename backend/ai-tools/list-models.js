import https from 'https';
import dotenv from 'dotenv';

dotenv.config();

console.log('Script started.');

const key = process.env.GEMINI_API_KEY;
if (!key) {
    console.error('No API Key found');
    process.exit(1);
}
console.log('API Key found (length):', key.length);

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
console.log('Fetching:', url.replace(key, 'HIDDEN'));

const req = https.get(url, (res) => {
    console.log('Response status:', res.statusCode);
    let data = '';
    res.on('data', (c) => data += c);
    res.on('end', () => {
        console.log('Body:', data.substring(0, 500)); // Print first 500 chars
        try {
            const json = JSON.parse(data);
            if (json.models) {
                console.log('MODELS FOUND:');
                json.models.forEach(m => console.log(m.name));
            } else {
                console.log('No models property in JSON');
            }
        } catch (e) { console.error('JSON Error', e); }
    });
});

req.on('error', (e) => {
    console.error('Request Error:', e);
});
req.end();
