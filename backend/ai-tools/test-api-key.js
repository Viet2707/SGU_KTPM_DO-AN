// 🔧 Test Gemini API Key Directly
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

console.log('🔑 Testing Gemini API Key...');
console.log(`Key: ${apiKey?.substring(0, 10)}...${apiKey?.substring(apiKey.length - 5)}`);
console.log(`Length: ${apiKey?.length} characters`);

if (!apiKey) {
    console.error('❌ No API key found in .env file');
    process.exit(1);
}

try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    console.log('\n🤖 Sending test request to Gemini...');

    const result = await model.generateContent("Say 'Hello, API key is working!' in one sentence.");
    const response = await result.response;
    const text = response.text();

    console.log('\n✅ SUCCESS! API Key is valid!');
    console.log(`Response: ${text}`);

} catch (error) {
    console.error('\n❌ FAILED! API Key is invalid or has issues:');
    console.error(error.message);

    console.log('\n📝 Troubleshooting steps:');
    console.log('1. Go to https://aistudio.google.com/apikey');
    console.log('2. Check if the API key is enabled');
    console.log('3. Try creating a new API key');
    console.log('4. Make sure there are no restrictions on the key');
    console.log('5. Verify you have access to Gemini API (free tier)');

    process.exit(1);
}
