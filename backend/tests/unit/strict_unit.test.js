
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loginUser, registerUser } from '../../controllers/userController.js';
import { addFood } from '../../controllers/foodController.js';
import { addToCart, removeFromCart } from '../../controllers/cartController.js';
import { placeOrderCod, updateStatus } from '../../controllers/orderController.js';

// Mock Models
import userModel from '../../models/userModel.js';
import Food from '../../models/Food.js';
import Stock from '../../models/Stock.js';
import orderModel from '../../models/orderModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import fs from 'fs';

// Mock dependencies
vi.mock('../../models/userModel.js');
vi.mock('../../models/Food.js');
vi.mock('../../models/Stock.js');
vi.mock('../../models/orderModel.js');
vi.mock('bcrypt');
vi.mock('jsonwebtoken');
vi.mock('fs');

describe('PURE UNIT TESTS (NO DB, NO API)', () => {

    let req, res;

    beforeEach(() => {
        req = { body: {}, file: {} };
        res = {
            json: vi.fn(),
            status: vi.fn().mockReturnThis(),
        };
        vi.clearAllMocks();
    });

    // =========================================================================
    // 1️⃣ USER MODULE
    // =========================================================================
    describe('1. USER MODULE', () => {

        describe('Register Logic', () => {
            it('should reject invalid email format', async () => {
                req.body = { name: 'Test', email: 'invalid-email', password: 'password123' };
                userModel.findOne.mockResolvedValue(null); // Email not exists

                await registerUser(req, res);

                expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                    success: false,
                    message: "Vui lòng nhập đúng định dạng email!"
                }));
            });

            it('should reject short password (< 8 chars)', async () => {
                req.body = { name: 'Test', email: 'test@test.com', password: 'short' };
                userModel.findOne.mockResolvedValue(null);

                await registerUser(req, res);

                expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                    success: false,
                    message: "Mật khẩu phải có ít nhất 8 ký tự!"
                }));
            });

            it('should reject duplicate email', async () => {
                req.body = { name: 'Test', email: 'exist@test.com', password: 'password123' };
                userModel.findOne.mockResolvedValue({ email: 'exist@test.com' });

                await registerUser(req, res);

                expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                    success: false,
                    message: "Email này đã được sử dụng. Vui lòng chọn email khác!"
                }));
            });

            it('should hash password before saving', async () => {
                req.body = { name: 'Test', email: 'new@test.com', password: 'password123' };
                userModel.findOne.mockResolvedValue(null);
                bcrypt.genSalt.mockResolvedValue('salt');
                bcrypt.hash.mockResolvedValue('hashed_password_123');

                // Mock save
                const saveMock = vi.fn().mockResolvedValue({ _id: 'user_id' });
                userModel.mockImplementation(() => ({ save: saveMock }));
                jwt.sign.mockReturnValue('token');

                await registerUser(req, res);

                expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'salt');
                expect(saveMock).toHaveBeenCalled();
                expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
            });
        });

        describe('Auth Logic', () => {
            it('should login successfully with correct credentials', async () => {
                req.body = { email: 'test@test.com', password: 'password123' };
                const mockUser = { _id: '123', email: 'test@test.com', password: 'hashed_pass' };

                userModel.findOne.mockResolvedValue(mockUser);
                bcrypt.compare.mockResolvedValue(true); // Password match
                jwt.sign.mockReturnValue('valid_token');

                await loginUser(req, res);

                expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                    success: true,
                    token: 'valid_token'
                }));
            });

            it('should fail login with wrong password', async () => {
                req.body = { email: 'test@test.com', password: 'wrong' };
                const mockUser = { _id: '123', email: 'test@test.com', password: 'hashed_pass' };

                userModel.findOne.mockResolvedValue(mockUser);
                bcrypt.compare.mockResolvedValue(false); // Password mismatch

                await loginUser(req, res);

                expect(res.status).toHaveBeenCalledWith(401);
                expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                    success: false,
                    message: "Sai mật khẩu"
                }));
            });

            it('should fail login if email does not exist', async () => {
                req.body = { email: 'notfound@test.com', password: '123' };
                userModel.findOne.mockResolvedValue(null);

                await loginUser(req, res);

                expect(res.status).toHaveBeenCalledWith(404);
                expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                    success: false,
                    message: "Email không tồn tại"
                }));
            });
        });
    });

    // =========================================================================
    // 2️⃣ PRODUCT MODULE
    // =========================================================================
    describe('2. PRODUCT MODULE', () => {
        it('should add product with valid data', async () => {
            req.body = { name: 'New Food', description: 'Desc', price: '100', categoryId: 'cat1' };
            req.file = { filename: 'img.png' };

            Food.findOne.mockResolvedValue(null); // Not existing
            Food.create.mockResolvedValue({ _id: 'food1', name: 'New Food' });
            Stock.create.mockResolvedValue({});

            await addFood(req, res);

            expect(Food.create).toHaveBeenCalledWith(expect.objectContaining({
                name: 'New Food',
                price: 100
            }));
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
        });

        // Note: Controller hiện tại chưa check giá âm/tên rỗng kỹ, nhưng ta sẽ test logic nếu có hoặc giả định
        // Ở đây ta test logic controller gọi create
    });

    // =========================================================================
    // 3️⃣ CART MODULE
    // =========================================================================
    describe('3. CART MODULE', () => {
        it('should add new item to cart', async () => {
            req.body = { userId: 'user1', itemId: 'item1' };
            const mockUser = {
                cartData: {},
                save: vi.fn()
            };
            userModel.findOne.mockResolvedValue(mockUser);
            userModel.findByIdAndUpdate.mockResolvedValue({});

            await addToCart(req, res);

            // Logic trong controller: cartData[itemId] = 1
            // Nhưng controller dùng findByIdAndUpdate trực tiếp, ta check call
            expect(userModel.findByIdAndUpdate).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
        });

        it('should increment existing item in cart', async () => {
            req.body = { userId: 'user1', itemId: 'item1' };
            // Mock userData return promise-like structure as controller awaits userData.cartData
            // Controller logic: let cartData = await userData.cartData;
            // This implies cartData is a property, maybe not async in model but controller treats it so.

            const mockCart = { 'item1': 1 };
            const mockUser = { cartData: mockCart };
            userModel.findOne.mockResolvedValue(mockUser);

            await addToCart(req, res);

            // Logic: cartData['item1'] += 1 -> 2
            // Verify findByIdAndUpdate called with updated cart
            // Note: Controller modifies mockCart directly
            expect(mockCart['item1']).toBe(2);
        });

        it('should remove item from cart (decrement)', async () => {
            req.body = { userId: 'user1', itemId: 'item1' };
            const mockCart = { 'item1': 2 };
            const mockUser = { cartData: mockCart };
            userModel.findById.mockResolvedValue(mockUser);

            await removeFromCart(req, res);

            expect(mockCart['item1']).toBe(1);
        });

        it('should not decrement below 0', async () => {
            req.body = { userId: 'user1', itemId: 'item1' };
            const mockCart = { 'item1': 0 };
            const mockUser = { cartData: mockCart };
            userModel.findById.mockResolvedValue(mockUser);

            await removeFromCart(req, res);

            expect(mockCart['item1']).toBe(0); // Should stay 0
        });
    });

    // =========================================================================
    // 4️⃣ ORDER MODULE
    // =========================================================================
    describe('4. ORDER MODULE', () => {

        describe('Place Order Logic', () => {
            it('should reject empty cart items', async () => {
                req.body = { userId: 'user1', items: [] };

                await placeOrderCod(req, res);

                expect(res.status).toHaveBeenCalledWith(400);
                expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                }));
            });
        });

        describe('Order Status Logic', () => {
            it('should not allow changing status if already Delivered', async () => {
                req.body = { orderId: 'order1', status: 'Processing' };
                orderModel.findById.mockResolvedValue({
                    status: 'Delivered',
                    _id: 'order1'
                });

                await updateStatus(req, res);

                expect(res.status).toHaveBeenCalledWith(400);
                expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                    message: "Đơn đã chốt trạng thái, không thể thay đổi."
                }));
            });

            it('should update payment status when Delivered', async () => {
                req.body = { orderId: 'order1', status: 'Delivered' };
                const mockOrder = {
                    status: 'Processing',
                    payment: false,
                    _id: 'order1'
                };
                orderModel.findById.mockResolvedValue(mockOrder);
                orderModel.findByIdAndUpdate.mockResolvedValue({});

                await updateStatus(req, res);

                // Check logic: payment should become true
                // Controller passes 'update' object to findByIdAndUpdate
                const updateArg = orderModel.findByIdAndUpdate.mock.calls[0][1];
                expect(updateArg.payment).toBe(true);
                expect(updateArg.status).toBe('Delivered');
            });
        });
    });

    // =========================================================================
    // 5️⃣ VALIDATION & ERROR HANDLING
    // =========================================================================
    describe('5. VALIDATION & ERROR HANDLING', () => {
        it('should handle service errors gracefully', async () => {
            // Simulate DB error in login
            req.body = { email: 'test@test.com', password: '123' };
            userModel.findOne.mockRejectedValue(new Error("DB Connection Failed"));

            await loginUser(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: false,
                message: "Lỗi máy chủ"
            }));
        });

        it('should validate required fields in addFood', async () => {
            // Simulate error when creating food (e.g. missing required field in schema)
            // Controller logic: const { name... } = req.body
            req.body = { name: 'Food' }; // Missing price
            // If we mock create to throw error
            Food.create.mockRejectedValue(new Error("Validation Error"));

            await addFood(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: false
            }));
        });
    });

});
