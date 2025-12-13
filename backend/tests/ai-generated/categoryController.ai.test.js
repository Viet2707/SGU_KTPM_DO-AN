import { describe, expect, test, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import Category from '../../models/Category.js';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

describe('Category API Integration Tests', () => {
  let token;
  const testCategoryName = 'Test Category';
  let testCategoryId;

  beforeEach(async () => {
    // Clear the Category collection before each test
    await Category.deleteMany({});

    // Create a valid JWT token for authentication
    token = jwt.sign({ userId: 'testUserId' }, '123');

    // Create a test category for update and delete tests
    const testCategory = new Category({ name: testCategoryName });
    await testCategory.save();
    testCategoryId = testCategory._id.toString();
  });


  // Test GET /api/category/list - Lấy danh sách category
  describe('GET /api/category/list', () => {
    test('Should return a list of categories', async () => {
      // Arrange
      const newCategory = new Category({ name: 'New Category' });
      await newCategory.save();

      // Act
      const response = await request(app)
        .get('/api/category/list')
        .set('token', token);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.categories).toBeInstanceOf(Array);
      expect(response.body.categories.length).toBeGreaterThan(0);
    });

    test('Should return an empty list when no categories exist', async () => {
      // Arrange - Categories are already cleared in beforeEach

      // Act
      const response = await request(app)
        .get('/api/category/list')
        .set('token', token);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.categories).toBeInstanceOf(Array);
      expect(response.body.categories.length).toBe(0);
    });

    test('Should handle errors and return 500', async () => {
      // Arrange
      Category.find = () => Promise.reject(new Error('Database error'));

      // Act
      const response = await request(app)
        .get('/api/category/list')
        .set('token', token);

      // Assert
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Database error');

      // Restore original find function (optional, but good practice)
      Category.find = mongoose.model('Category').find;
    });
  });
  

  // Test GET /api/category - Lấy danh sách category (duplicate route)
  describe('GET /api/category', () => {
    test('Should return a list of categories (duplicate route)', async () => {
      const newCategory = new Category({ name: 'Another Category' });
      await newCategory.save();

      const response = await request(app)
        .get('/api/category')
        .set('token', token);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.categories).toBeInstanceOf(Array);
      expect(response.body.categories.length).toBeGreaterThan(0);
    });
  });

  // Test POST /api/category - Tạo category mới
  describe('POST /api/category', () => {
    test('Should create a new category successfully', async () => {
      // Arrange
      const newCategoryName = 'New Category';

      // Act
      const response = await request(app)
        .post('/api/category')
        .set('token', token)
        .send({ name: newCategoryName });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.category).toBeDefined();
      expect(response.body.category.name).toBe(newCategoryName);

      // Verify that the category was actually created in the database
      const createdCategory = await Category.findById(response.body.category._id);
      expect(createdCategory).toBeDefined();
      expect(createdCategory.name).toBe(newCategoryName);
    });

    test('Should return an error if the category name is missing', async () => {
      // Arrange (empty body)

      // Act
      const response = await request(app)
        .post('/api/category')
        .set('token', token)
        .send({});

      // Assert
      expect(response.status).toBe(200); // Or 400 if you change validation
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Tên category không được rỗng');
    });

    test('Should handle errors during category creation', async () => {
      // Arrange
      Category.create = () => Promise.reject(new Error('Database error during creation'));

      // Act
      const response = await request(app)
        .post('/api/category')
        .set('token', token)
        .send({ name: 'Test' });

      // Assert
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Database error during creation');

      // Restore original create function
      Category.create = mongoose.model('Category').create;
    });
  });

  // Test PUT /api/category/:id - Update category
  describe('PUT /api/category/:id', () => {
    test('Should update an existing category successfully', async () => {
      // Arrange
      const updatedCategoryName = 'Updated Category Name';

      // Act
      const response = await request(app)
        .put(`/api/category/${testCategoryId}`)
        .set('token', token)
        .send({ name: updatedCategoryName });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.category).toBeDefined();
      expect(response.body.category.name).toBe(updatedCategoryName);

      // Verify that the category was actually updated in the database
      const updatedCategory = await Category.findById(testCategoryId);
      expect(updatedCategory).toBeDefined();
      expect(updatedCategory.name).toBe(updatedCategoryName);
    });

    test('Should return an error if the category is not found', async () => {
      // Arrange
      const nonExistentCategoryId = new mongoose.Types.ObjectId();

      // Act
      const response = await request(app)
        .put(`/api/category/${nonExistentCategoryId}`)
        .set('token', token)
        .send({ name: 'Update attempt' });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Không tìm thấy category');
    });

    test('Should handle errors during category update', async () => {
      // Arrange
      Category.findByIdAndUpdate = () => Promise.reject(new Error('Database error during update'));

      // Act
      const response = await request(app)
        .put(`/api/category/${testCategoryId}`)
        .set('token', token)
        .send({ name: 'Test' });

      // Assert
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Database error during update');

      // Restore original findByIdAndUpdate function
      Category.findByIdAndUpdate = mongoose.model('Category').findByIdAndUpdate;
    });
  });

  // Test DELETE /api/category/:id - Xoá category
  describe('DELETE /api/category/:id', () => {
    test('Should delete an existing category successfully', async () => {
      // Act
      const response = await request(app)
        .delete(`/api/category/${testCategoryId}`)
        .set('token', token);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Đã xoá category');

      // Verify that the category was actually deleted from the database
      const deletedCategory = await Category.findById(testCategoryId);
      expect(deletedCategory).toBeNull();
    });

    test('Should return an error if the category is not found for deletion', async () => {
      // Arrange
      const nonExistentCategoryId = new mongoose.Types.ObjectId();

      // Act
      const response = await request(app)
        .delete(`/api/category/${nonExistentCategoryId}`)
        .set('token', token);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Không tìm thấy category');
    });

    test('Should handle errors during category deletion', async () => {
      // Arrange
      Category.findByIdAndDelete = () => Promise.reject(new Error('Database error during deletion'));

      // Act
      const response = await request(app)
        .delete(`/api/category/${testCategoryId}`)
        .set('token', token);

      // Assert
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Database error during deletion');

      // Restore original findByIdAndDelete function
      Category.findByIdAndDelete = mongoose.model('Category').findByIdAndDelete;
    });
  });
});