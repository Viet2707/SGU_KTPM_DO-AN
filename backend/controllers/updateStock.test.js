import { describe, it, expect, beforeEach, vi } from 'vitest';
import { decStock, incStock } from './updateStock.js';
import Stock from '../models/Stock.js';

vi.mock('../models/Stock.js');

describe('Stock Updaters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('decStock (Decrement Stock)', () => {
    it('should successfully decrement stock for multiple items', async () => {
      const items = [
        { _id: 'plant1', quantity: 2 },
        { foodId: 'plant2', qty: 1 },
      ];
      // Giả lập rằng cả hai lần update đều thành công
      Stock.updateOne.mockResolvedValue({ modifiedCount: 1 });

      // Hàm nên chạy xong mà không có lỗi
      await expect(decStock(items)).resolves.toBeUndefined();

      expect(Stock.updateOne).toHaveBeenCalledTimes(2);
      expect(Stock.updateOne).toHaveBeenCalledWith(
        { foodId: 'plant1', quantity: { $gte: 2 } },
        { $inc: { quantity: -2 } },
        { session: undefined }
      );
      expect(Stock.updateOne).toHaveBeenCalledWith(
        { foodId: 'plant2', quantity: { $gte: 1 } },
        { $inc: { quantity: -1 } },
        { session: undefined }
      );
    });

    it('should throw "OUT_OF_STOCK" error if an item is out of stock', async () => {
      const items = [{ foodId: 'plant1', quantity: 5 }];
      // Giả lập update thất bại (modifiedCount = 0) do không đủ hàng
      Stock.updateOne.mockResolvedValue({ modifiedCount: 0 });

      // Mong đợi hàm sẽ throw lỗi với message cụ thể
      await expect(decStock(items)).rejects.toThrow('OUT_OF_STOCK');

      expect(Stock.updateOne).toHaveBeenCalledWith(
        { foodId: 'plant1', quantity: { $gte: 5 } },
        { $inc: { quantity: -5 } },
        { session: undefined }
      );
    });
  });

  describe('incStock (Increment Stock)', () => {
    it('should successfully increment stock for multiple items', async () => {
      const items = [
        { _id: 'plant1', quantity: 3 },
        { foodId: 'plant2', qty: 5 },
      ];
      Stock.updateOne.mockResolvedValue({ modifiedCount: 1 });

      await expect(incStock(items)).resolves.toBeUndefined();

      expect(Stock.updateOne).toHaveBeenCalledTimes(2);
      expect(Stock.updateOne).toHaveBeenCalledWith(
        { foodId: 'plant1' },
        { $inc: { quantity: 3 } },
        { session: undefined }
      );
      expect(Stock.updateOne).toHaveBeenCalledWith(
        { foodId: 'plant2' },
        { $inc: { quantity: 5 } },
        { session: undefined }
      );
    });
  });
});
