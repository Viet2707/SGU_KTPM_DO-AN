import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import app from '../../app.js'; // Assuming app.js sets up Express
import userModel from '../../models/userModel.js';

// Mock environment variables used by the controller
process.env.JWT_SECRET = 'test_secret_for_jwt'; // A consistent secret for testing
process.env.PORT = '3001'; // Mocked port, if app needs it to start

const BASE_URL = '/api/user';

describe('User Authentication Controller Integration Tests', () => {
  let testUser; // To store a user registered in beforeEach
  let testUserToken; // To store a token for the testUser

  // Clear the database and setup a default test user before each test
  beforeEach(async () => {
    // 1. Arrange: Clean the database
    await userModel.deleteMany({});

    // 2. Arrange: Create a default user for login and authenticated route tests
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Password123!', salt);
    testUser = await userModel.create({
      name: 'Default Test User',
      email: 'default@example.com',
      password: hashedPassword,
      status: 'active', // Default status for test user
    });
    // Create a token for this user for authenticated tests
    testUserToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET);
  });

  // Ensure mocks are cleaned up after each test to prevent interference
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // --- Register User Tests (POST /api/user/register) ---
  describe('POST /api/user/register', () => {
    it('should register a new user successfully with valid data', async () => {
      // Arrange
      const newUser = {
        name: 'New Register User',
        email: 'newregister@example.com',
        password: 'StrongPassword123!',
      };

      // Act
      const response = await request(app)
        .post(`${BASE_URL}/register`)
        .send(newUser);

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Đăng ký thành công!');
      expect(response.body.token).toBeDefined();

      // Verify user was saved to the database
      const createdUser = await userModel.findOne({ email: newUser.email });
      expect(createdUser).not.toBeNull();
      expect(createdUser.name).toBe(newUser.name);
      // Check if password was hashed correctly
      expect(await bcrypt.compare(newUser.password, createdUser.password)).toBe(true);
    });

    it('should return an error if email already exists', async () => {
      // Arrange (testUser with 'default@example.com' already exists from beforeEach)
      const existingUserAttempt = {
        name: 'Existing Email User',
        email: testUser.email, // Use the email of the user created in beforeEach
        password: 'AnotherSecurePassword!',
      };

      // Act
      const response = await request(app)
        .post(`${BASE_URL}/register`)
        .send(existingUserAttempt);

      // Assert
      expect(response.statusCode).toBe(200); // Controller returns 200 for this specific error
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Email này đã được sử dụng. Vui lòng chọn email khác!');
    });

    it('should return an error for invalid email format', async () => {
      // Arrange
      const invalidEmailUser = {
        name: 'Invalid Email',
        email: 'not-an-email', // Invalid email format
        password: 'ValidPassword123!',
      };

      // Act
      const response = await request(app)
        .post(`${BASE_URL}/register`)
        .send(invalidEmailUser);

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Vui lòng nhập đúng định dạng email!');
    });

    it('should return an error for password less than 8 characters', async () => {
      // Arrange
      const shortPasswordUser = {
        name: 'Short Pass',
        email: 'shortpass@example.com',
        password: 'short', // Password length < 8
      };

      // Act
      const response = await request(app)
        .post(`${BASE_URL}/register`)
        .send(shortPasswordUser);

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Mật khẩu phải có ít nhất 8 ký tự!');
    });

    it('should return a server error message if an internal error occurs during registration', async () => {
      // Arrange
      // Mock userModel.prototype.save to throw an error, simulating a database issue
      vi.spyOn(userModel.prototype, 'save').mockImplementationOnce(() => {
        throw new Error('Simulated database save error');
      });

      const newUser = {
        name: 'Error Trigger User',
        email: 'errortrigger@example.com',
        password: 'SecurePassword123!',
      };

      // Act
      const response = await request(app)
        .post(`${BASE_URL}/register`)
        .send(newUser);

      // Assert
      expect(response.statusCode).toBe(200); // Controller returns 200 for internal errors in registerUser
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Có lỗi xảy ra khi đăng ký. Vui lòng thử lại!');
    });
  });

  // --- Login User Tests (POST /api/user/login) ---
  describe('POST /api/user/login', () => {
    it('should log in an existing user successfully with correct credentials', async () => {
      // Arrange (testUser is already registered in beforeEach)
      const credentials = {
        email: testUser.email,
        password: 'Password123!', // The password used to create testUser
      };

      // Act
      const response = await request(app)
        .post(`${BASE_URL}/login`)
        .send(credentials);

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Đăng nhập thành công');
      expect(response.body.token).toBeDefined();
    });

    it('should return 404 if the email does not exist', async () => {
      // Arrange
      const credentials = {
        email: 'nonexistent@example.com',
        password: 'Password123!',
      };

      // Act
      const response = await request(app)
        .post(`${BASE_URL}/login`)
        .send(credentials);

      // Assert
      expect(response.statusCode).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Email không tồn tại');
    });

    it('should return 401 for incorrect password', async () => {
      // Arrange (testUser exists from beforeEach)
      const credentials = {
        email: testUser.email,
        password: 'WrongPassword!', // Incorrect password
      };

      // Act
      const response = await request(app)
        .post(`${BASE_URL}/login`)
        .send(credentials);

      // Assert
      expect(response.statusCode).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Sai mật khẩu');
    });

    it('should return 403 if the user account is locked', async () => {
      // Arrange
      // Update the testUser's status to 'lock'
      await userModel.findByIdAndUpdate(testUser._id, { status: 'lock' });

      const credentials = {
        email: testUser.email,
        password: 'Password123!',
      };

      // Act
      const response = await request(app)
        .post(`${BASE_URL}/login`)
        .send(credentials);

      // Assert
      expect(response.statusCode).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.');
    });

    it('should return 500 if a server error occurs during login', async () => {
      // Arrange
      // Mock userModel.findOne to throw an error, simulating a database find issue
      vi.spyOn(userModel, 'findOne').mockImplementationOnce(() => {
        throw new Error('Simulated database find error');
      });

      const credentials = {
        email: testUser.email,
        password: 'Password123!',
      };

      // Act
      const response = await request(app)
        .post(`${BASE_URL}/login`)
        .send(credentials);

      // Assert
      expect(response.statusCode).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Lỗi máy chủ');
    });
  });

  // --- Authenticated Route Tests (GET /api/user/status) ---
  describe('GET /api/user/status (Protected Route)', () => {
    it('should return the user status if authenticated with a valid token', async () => {
      // Arrange (testUser and testUserToken are available from beforeEach)

      // Act
      const response = await request(app)
        .get(`${BASE_URL}/status`)
        .set('token', testUserToken); // Attach the generated token

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.status).toBe(testUser.status); // Expecting 'active' as set in beforeEach
    });

    // NOTE: As per instructions, tests for missing or invalid tokens are not generated
    // as the authMiddleware is expected to handle those scenarios outside of the controller's direct logic.
  });
});