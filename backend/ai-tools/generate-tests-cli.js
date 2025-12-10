#!/usr/bin/env node
// 🚀 CLI Tool for AI-Powered Test Generation
import { generateTestsForController } from './ai-test-generator.js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m'
};

// In banner giới thiệu
function printBanner() {
    console.log(colors.cyan + colors.bright);
    console.log('╔════════════════════════════════════════════╗');
    console.log('║   🤖 AI-Powered Test Generator            ║');
    console.log('║   Powered by Google Gemini                ║');
    console.log('╚════════════════════════════════════════════╝');
    console.log(colors.reset);
}

// In hướng dẫn sử dụng
function printUsage() {
    console.log(`
${colors.bright}USAGE:${colors.reset}
  node generate-tests-cli.js [options]

${colors.bright}OPTIONS:${colors.reset}
  --controller <name>    Generate tests for specific controller
                         Example: --controller userController
  
  --all                  Generate tests for all controllers

  --scenarios            Generate markdown test scenarios ONLY (no code)

  --preview              Preview generated code without saving
  
  --help                 Show this help message

${colors.bright}EXAMPLES:${colors.reset}
  ${colors.green}# Generate tests for userController${colors.reset}
  node ai-tools/generate-tests-cli.js --controller userController
  
  ${colors.green}# Preview without saving${colors.reset}
  node ai-tools/generate-tests-cli.js --controller foodController --preview
  
  ${colors.green}# Generate tests for all controllers${colors.reset}
  node ai-tools/generate-tests-cli.js --all

  ${colors.green}# Generate test scenarios ONLY (no code)${colors.reset}
  node ai-tools/generate-tests-cli.js --controller orderController --scenarios
`);
}

// Lấy tất cả các file controller trong thư mục backend/controllers
async function getAllControllers() {
    const controllersDir = path.resolve(__dirname, '../controllers');
    const files = await fs.readdir(controllersDir);
    return files
        .filter(file => file.endsWith('Controller.js'))
        .map(file => file.replace('.js', ''));
}

async function appendHistory(controllerName, scenarios) {
    const historyFile = path.resolve(__dirname, '../tests/ai-generated/generated_test_scenarios.md');

    const timestamp = new Date().toLocaleString();
    let content = `\n\n--- [${timestamp}] ${controllerName} ---\n`;
    scenarios.forEach((desc, index) => {
        content += `${index + 1}. ${desc}\n`;
    });

    try {
        await fs.appendFile(historyFile, content, 'utf8');
        console.log(colors.green + `   (Appended ${scenarios.length} scenarios to log file)` + colors.reset);
    } catch (err) {
        console.error("Failed to append history:", err.message);
    }
}

async function processGeneratedResult(result, isPreview) {
    if (isPreview) return;

    console.log(colors.green + '\n✨ Test generation completed!' + colors.reset);
    console.log(`📁 File: ${result.filePath}`);

    if (!result.isScenario) {
        // Trích xuất và liệt kê các test scenarios từ code
        const scenarios = [];
        const regex = /(?:it|test)\s*\(\s*['"`](.*?)['"`]/g;
        let match;
        while ((match = regex.exec(result.code)) !== null) {
            scenarios.push(match[1]);
        }

        console.log(colors.cyan + '\n🧬 Generated Test Scenarios:' + colors.reset);
        if (scenarios.length > 0) {
            scenarios.forEach((desc, index) => {
                console.log(`   ${index + 1}. ${desc}`);
            });
            // Append to log file
            await appendHistory(result.controllerName, scenarios);
        } else {
            console.log('   (No test cases detected in code)');
        }
    } else {
        console.log(colors.cyan + '\n📝 Scenarios generated successfully.' + colors.reset);

        // Trích xuất lines từ Markdown list
        const lines = result.code.split('\n');
        const scenarios = lines
            .map(line => line.trim())
            .filter(line => line.match(/^(\d+\.|-|\*)\s+/)) // Lấy các dòng bắt đầu bằng số hoặc gạch đầu dòng
            .map(line => line.replace(/^(\d+\.|-|\*)\s+/, '').replace(/^\*\*|\*\*$/g, '')); // Xóa ký tự đầu dòng và bold

        if (scenarios.length > 0) {
            scenarios.forEach((desc, index) => {
                console.log(`   ${index + 1}. ${desc}`);
            });
            await appendHistory(result.controllerName, scenarios);
        } else {
            console.log('   (No list items found in AI output)');
            // Fallback: log raw output if parsing fails? 
            // Maybe just append the raw lines?
        }
    }

    console.log(`\n📊 Functions covered: ${result.functionsCount}`);
}

async function main() {
    printBanner();

    // Kiểm tra xem đã có GEMINI_API_KEY chưa
    if (!process.env.GEMINI_API_KEY) {
        console.error(colors.red + '❌ ERROR: GEMINI_API_KEY not found in .env file' + colors.reset);
        console.log('\nPlease add your Google Gemini API key to backend/.env:');
        console.log(colors.yellow + 'GEMINI_API_KEY=your_api_key_here' + colors.reset);
        console.log('\nGet your free API key at: https://aistudio.google.com/apikey');
        process.exit(1);
    }

    const args = process.argv.slice(2);

    // Parse các tham số dòng lệnh (arguments)
    const flags = {
        controller: null,
        all: false,
        scenarios: false,
        preview: false, // Chế độ xem trước, không lưu file
        help: false
    };

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--controller' && args[i + 1]) {
            flags.controller = args[i + 1];
            i++;
        } else if (args[i] === '--all') {
            flags.all = true;
        } else if (args[i] === '--scenarios') {
            flags.scenarios = true;
        } else if (args[i] === '--preview') {
            flags.preview = true;
        } else if (args[i] === '--help' || args[i] === '-h') {
            flags.help = true;
        }
    }

    if (flags.help || args.length === 0) {
        printUsage();
        process.exit(0);
    }

    try {
        if (flags.all) {
            // Chế độ Generate cho TẤT CẢ controllers
            console.log(colors.blue + '📦 Generating tests for ALL controllers...\n' + colors.reset);
            const controllers = await getAllControllers();

            console.log(`Found ${controllers.length} controllers: ${controllers.join(', ')}\n`);

            let successCount = 0;
            let failCount = 0;

            for (const controller of controllers) {
                try {
                    const controllerPath = `controllers/${controller}.js`;
                    const result = await generateTestsForController(controllerPath, { preview: flags.preview, scenarios: flags.scenarios });
                    await processGeneratedResult(result, flags.preview);

                    successCount++;
                } catch (error) {
                    console.error(colors.red + `❌ Failed for ${controller}: ${error.message}` + colors.reset);
                    failCount++;
                }
                console.log(''); // Empty line between controllers
            }

            console.log(colors.bright + '\n═══════════════════════════════════════════' + colors.reset);
            console.log(colors.green + `✅ Success: ${successCount}` + colors.reset);
            if (failCount > 0) {
                console.log(colors.red + `❌ Failed: ${failCount}` + colors.reset);
            }

        } else if (flags.controller) {
            // Chế độ Generate cho 1 controller cụ thể
            const controllerName = flags.controller.endsWith('Controller')
                ? flags.controller
                : flags.controller + 'Controller';

            const controllerPath = `controllers/${controllerName}.js`;

            const result = await generateTestsForController(controllerPath, { preview: flags.preview, scenarios: flags.scenarios });
            await processGeneratedResult(result, flags.preview);

            if (!flags.preview) {
                console.log('\n' + colors.yellow + '💡 Next steps:' + colors.reset);
                console.log(`   1. Review the generated test file`);
                console.log(`   2. Run: npm test ${result.filePath}`);
                console.log(`   3. Adjust tests as needed`);
            }

        } else {
            console.error(colors.red + '❌ Please specify --controller or --all' + colors.reset);
            printUsage();
            process.exit(1);
        }

    } catch (error) {
        console.error(colors.red + '\n❌ ERROR: ' + error.message + colors.reset);
        process.exit(1);
    }
}

// Run CLI
main().catch(error => {
    console.error(colors.red + 'Fatal error: ' + error.message + colors.reset);
    process.exit(1);
});
