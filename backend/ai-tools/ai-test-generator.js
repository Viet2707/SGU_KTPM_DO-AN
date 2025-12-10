//  AI Test Generator Core - Google Gemini Integration
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Khởi tạo Gemini AI - Được thực hiện bên trong hàm generateTestCases để đảm bảo biến môi trường đã được load
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Tìm file route tương ứng với controller
 * Ví dụ: categoryController.js -> categoryRoute.js hoặc category.js trong thư mục routes
 */
async function findMatchingRouteFile(controllerName) {
    try {
        const routesDir = path.resolve(__dirname, '../routes');
        const files = await fs.readdir(routesDir);

        // Logic match: cartController -> cartRoute.js, cart.js, etc.
        // Remove 'Controller' suffix: cartController -> cart
        const baseName = controllerName.replace('Controller', '').toLowerCase();

        for (const file of files) {
            const lowerFile = file.toLowerCase();
            // Check if file starts with baseName (e.g. 'cart' in 'cartRoute.js')
            if (lowerFile.startsWith(baseName) && lowerFile.endsWith('.js')) {
                return path.join(routesDir, file);
            }
        }
        return null;
    } catch (error) {
        console.warn('⚠️ Warning: Could not scan routes directory:', error.message);
        return null;
    }
}

/**
 * Phân tích code controller và trích xuất thông tin cần thiết
 * @param {string} controllerPath - Đường dẫn đến file controller
 * @returns {Promise<Object>} Object chứa thông tin controller đã phân tích
 */
export async function analyzeController(controllerPath) {
    try {
        const fullPath = path.resolve(__dirname, '..', controllerPath);
        const code = await fs.readFile(fullPath, 'utf-8');

        const fileName = path.basename(controllerPath);
        const controllerName = fileName.replace('.js', '');

        // Tìm và đọc file route liên quan
        let routeCode = null;
        const routePath = await findMatchingRouteFile(controllerName);
        if (routePath) {
            try {
                routeCode = await fs.readFile(routePath, 'utf-8');
                console.log(`   + Found associated route file: ${path.basename(routePath)}`);
            } catch (err) {
                console.warn(`   ! Failed to read route file: ${err.message}`);
            }
        }

        return {
            name: controllerName,
            path: controllerPath,
            code: code,
            functions: extractFunctions(code),
            routeCode: routeCode // Code của file route đi kèm
        };
    } catch (error) {
        throw new Error(`Failed to analyze controller: ${error.message}`);
    }
}

/**
 * Trích xuất tên các hàm từ code của controller bằng Regex
 * @param {string} code - Source code của controller
 * @returns {Array<string>} Danh sách tên các hàm
 */
function extractFunctions(code) {
    // Regex tìm các hàm được export (vd: export const getUsers = ...)
    const functionRegex = /export\s+(?:const|async\s+function)\s+(\w+)\s*=/g;
    const matches = [...code.matchAll(functionRegex)];
    return matches.map(match => match[1]);
}

/**
 * Tạo test cases sử dụng Google Gemini AI
 * @param {Object} controllerInfo - Thông tin controller đã phân tích
 * @returns {Promise<string>} Code test đã được sinh ra
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Danh sách các model để thử (Fallback strategy)
const MODELS_TO_TRY = [
    "gemini-2.0-flash",      // Ưu tiên cao nhất
    "gemini-2.0-flash-exp",  // Bản thử nghiệm mới
    "gemini-2.5-flash",      // Bản update tương lai (nếu có)
    "gemini-1.5-pro-latest"  // Bản ổn định cũ
];

export async function generateTestCases(controllerInfo) {
    const maxRetries = 10;
    let attempt = 0;

    while (attempt < maxRetries) {
        const modelName = MODELS_TO_TRY[attempt % MODELS_TO_TRY.length];

        try {
            console.log(`🤖 Generating tests for ${controllerInfo.name}...`);
            console.log(`   Model: ${modelName} (Attempt ${attempt + 1})`);

            // Khởi tạo Gemini AI tại đây để chắc chắn biến môi trường đã có
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: modelName });

            // Đã chuyển prompt vào generateTestCases logic hoặc truyền vào
            const prompt = controllerInfo.scenariosOnly
                ? buildScenarioPrompt(controllerInfo)
                : buildPrompt(controllerInfo);

            // Gửi yêu cầu đến Google AI
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const generatedCode = response.text();

            // Trích xuất code từ Markdown (nếu AI trả về dạng ```javascript ... ```)
            // Trích xuất code (nếu cần) hoặc giữ nguyên nếu là markdown scenario
            let finalContent = generatedCode;
            if (!controllerInfo.scenariosOnly) {
                const codeMatch = generatedCode.match(/```(?:javascript|js)?\n([\s\S]*?)\n```/);
                finalContent = codeMatch ? codeMatch[1] : generatedCode;
            }

            return finalContent;

        } catch (error) {
            // Handle 404 (Model Not Found) or Rate Limits
            const isNotFound = error.message.includes('404') || error.message.includes('not found');
            const isRateLimit = error.message.includes('429') ||
                error.message.includes('Too Many Requests') ||
                error.message.includes('Quota exceeded');
            const isOverloaded = error.message.includes('503') || error.message.includes('Overloaded');

            if (isNotFound || isRateLimit || isOverloaded) {
                attempt++;
                if (attempt >= maxRetries) throw new Error(`Failed after ${maxRetries} attempts across multiple models.`);

                const nextModel = MODELS_TO_TRY[attempt % MODELS_TO_TRY.length];

                if (isRateLimit || isOverloaded) {
                    // Try to parse retry delay
                    let waitTimeSeconds = 60;
                    const match1 = error.message.match(/retry in ([\d\.]+)s/);
                    if (match1) waitTimeSeconds = parseFloat(match1[1]);

                    // Don't wait full time if switching models, unless necessary
                    // but usually allow at least 5s to clear buffers
                    const waitTimeMs = 5000;

                    console.log(`\n⏳ Rate limit/Overload on ${modelName}. Switching to ${nextModel} in 5s...`);
                    await sleep(waitTimeMs);
                } else {
                    console.warn(`\n⚠️ Model ${modelName} not found/supported. Switching to ${nextModel}...`);
                }
                continue;
            }

            // Other errors
            throw new Error(`Failed to generate tests: ${error.message}`);
        }
    }
}


/**
 * Xây dựng Prompt (câu lệnh) để gửi cho AI
 * @param {Object} controllerInfo - Thông tin controller
 * @returns {string} Prompt đã định dạng sẵn
 */
function buildPrompt(controllerInfo) {
    let routeContext = "";
    if (controllerInfo.routeCode) {
        routeContext = `
**ASSOCIATED ROUTE FILE (Use to detect Middleware/Auth and Paths)**:
\`\`\`javascript
${controllerInfo.routeCode}
\`\`\`
`;
    } else {
        routeContext = `
**NOTE**: No associated route file found. Assume standard REST paths and verify if Auth is needed based on code logic.
`;
    }

    return `You are an expert software testing engineer specializing in Node.js backend testing with Vitest and Supertest.

**TASK**: Generate comprehensive integration tests for the following Express.js controller.

**CONTROLLER CODE**:
\`\`\`javascript
${controllerInfo.code}
\`\`\`
${routeContext}

**REQUIREMENTS**:
1. Use Vitest testing framework (import from "vitest")
2. Use Supertest for HTTP testing (import from "supertest")
3. Follow AAA pattern (Arrange-Act-Assert)
4. Include beforeEach for database cleanup
5. Test ALL functions found: ${controllerInfo.functions.join(', ')}
6. Cover success cases, error cases, and edge cases
7. Test validation.
8. **CRITICAL - AUTHENTICATION**: Check the "ASSOCIATED ROUTE FILE". 
   - If you see middleware like \`authMiddleware\` or \`verifyToken\`:
     - Import \`jsonwebtoken\`.
     - Create a fake JWT token in \`beforeEach\` (using secret "123" or similar).
     - Attach token to requests using \`.set('token', token)\` or Header.
     - DO NOT generate tests for "missing auth" or "invalid token" (middleware handles this). Only test the CONTROLLER logic.
9. **CRITICAL - ROUTES & PATHS**: Check the "ASSOCIATED ROUTE FILE" for exact paths.
   - If route is \`router.post("/add", ...)\` and app uses \`/api/cart\`, the test path is \`/api/cart/add\`.
   - Use correct Singular/Plural nouns based on the file content.
   - Example Map:
     - stockController -> stockRoutes.js -> /api/stocks
     - cartController -> cartRoute.js -> /api/cart
     - categoryController -> categoryRoute.js -> /api/category
10. Use descriptive test names in Vietnamese or English.
11. IMPORTANT: Use relative import path "../../app.js" for app
12. IMPORTANT: Use relative import path "../../models/[ModelName].js" for models

**OUTPUT**: Return ONLY the complete test file code, ready to save as a .test.js file. Do not include explanations.`;
}

/**
 * Xây dựng Prompt để sinh danh sách Test Scenarios (không phải code)
 */
function buildScenarioPrompt(controllerInfo) {
    return `You are an expert software QA engineer.

**TASK**: Analyze the following Node.js Controller code and list all necessary Test Cases (Test Scenarios). DO NOT write code.

**CONTROLLER CODE**:
\`\`\`javascript
${controllerInfo.code}
\`\`\`

**REQUIREMENTS**:
1. List comprehensive test scenarios for each function: ${controllerInfo.functions.join(', ')}
2. Cover Success cases, Error cases, Validation cases, and Edge cases.
3. For each test case, use the following format (List format, NOT Table):
   - **ID**: [e.g., TC-001]
   - **Description**: [What is being tested]
   - **Pre-condition**: [Setup required]
   - **Expected Result**: [What should happen]
   - **Type**: [Success / Error / Validation / Edge Case]

**OUTPUT**: Return ONLY the Markdown content. Do not use Markdown Tables. Use headers and lists.`;
}

/**
 * Lưu danh sách Test Scenarios vào file Markdown
 */
export async function saveTestScenarios(scenarioContent, controllerName) {
    try {
        const outputDir = path.resolve(__dirname, '../tests/ai-generated/scenarios');
        await fs.mkdir(outputDir, { recursive: true });

        const fileName = `${controllerName}_scenarios.md`;
        const filePath = path.join(outputDir, fileName);

        await fs.writeFile(filePath, scenarioContent, 'utf-8');
        console.log(`✅ Scenarios saved to: ${filePath}`);
        return filePath;
    } catch (error) {
        throw new Error(`Failed to save scenarios: ${error.message}`);
    }
}

/**
 * Lưu code test đã sinh ra vào file
 * @param {string} testCode - Code test
 * @param {string} controllerName - Tên controller
 * @returns {Promise<string>} Đường dẫn đến file đã lưu
 */
export async function saveGeneratedTest(testCode, controllerName) {
    try {
        const outputDir = path.resolve(__dirname, '../tests/ai-generated');

        // Create directory if not exists
        await fs.mkdir(outputDir, { recursive: true });

        const fileName = `${controllerName}.ai.test.js`;
        const filePath = path.join(outputDir, fileName);

        await fs.writeFile(filePath, testCode, 'utf-8');

        console.log(`✅ Test saved to: ${filePath}`);
        return filePath;
    } catch (error) {
        throw new Error(`Failed to save test: ${error.message}`);
    }
}

/**
 * Hàm chính để điều phối việc tạo test cho một controller
 * @param {string} controllerPath - Đường dẫn file controller
 * @param {boolean} preview - Nếu true, chỉ in ra màn hình chứ không lưu file
 * @returns {Promise<Object>} Kết quả thực hiện
 */
export async function generateTestsForController(controllerPath, options = { preview: false, scenarios: false }) {
    try {
        console.log(`\n🔍 Analyzing controller: ${controllerPath}`);

        // Step 1: Analyze controller
        const controllerInfo = await analyzeController(controllerPath);
        console.log(`📋 Found ${controllerInfo.functions.length} functions: ${controllerInfo.functions.join(', ')}`);

        // Step 2: Generate tests
        // Step 2: Generate tests or scenarios
        const aiOptions = { ...controllerInfo, scenariosOnly: options.scenarios };
        const generatedContent = await generateTestCases(aiOptions);

        if (options.preview) {
            console.log('\n📄 PREVIEW:\n');
            console.log(generatedContent);
            return { preview: true, code: generatedContent };
        }

        // Step 3: Save to file
        let filePath;
        if (options.scenarios) {
            // Skip saving individual scenario files as per user request
            filePath = "Log File (generated_test_scenarios.md)";
        } else {
            filePath = await saveGeneratedTest(generatedContent, controllerInfo.name);
        }

        return {
            success: true,
            controllerName: controllerInfo.name,
            filePath: filePath,
            functionsCount: controllerInfo.functions.length,
            code: generatedContent,
            isScenario: options.scenarios
        };
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        throw error;
    }
}
