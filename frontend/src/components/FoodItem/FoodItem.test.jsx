import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FoodItem from './FoodItem';
import { StoreContext } from '../../Context/StoreContext';
import { BrowserRouter } from 'react-router-dom';

// Mock assets
jest.mock('../../assets/assets', () => ({
  assets: {
    add_icon_white: 'add_icon_white.png',
    remove_icon_red: 'remove_icon_red.png',
    add_icon_green: 'add_icon_green.png',
    rating_starts: 'rating_starts.png',
  },
}));

describe('FoodItem Component', () => {

  // ✔ ĐÚNG THEO COMPONENT: dùng id, KHÔNG phải _id
  const mockFoodItem = {
    id: 'plant1',
    name: 'Cây Lưỡi Hổ',
    price: 120000,
    desc: 'Cây cảnh lọc không khí, dễ chăm sóc',
    image: 'luoiho.png',
  };

  // Helper render
  const renderWithProviders = (cartItems = {}) => {
    const mockContext = {
      cartItems,
      addToCart: jest.fn(),
      removeFromCart: jest.fn(),
      url: 'http://localhost:4000',
      currency: '₫',
    };

    render(
      <BrowserRouter>
        <StoreContext.Provider value={mockContext}>
          <FoodItem {...mockFoodItem} />
        </StoreContext.Provider>
      </BrowserRouter>
    );

    return mockContext;
  };

  it('should render food item details correctly', () => {
    renderWithProviders();

    expect(screen.getByText('Cây Lưỡi Hổ')).toBeInTheDocument();
    expect(screen.getByText('Cây cảnh lọc không khí, dễ chăm sóc')).toBeInTheDocument();
    expect(screen.getByText('120.000₫')).toBeInTheDocument();
    expect(screen.getByAltText('Cây Lưỡi Hổ')).toBeInTheDocument();
  });

  it('should display add icon when item is not in cart', async () => {
    const { addToCart } = renderWithProviders();
    const user = userEvent.setup();

    const addButton = screen.getByAltText('add');
    expect(addButton).toBeInTheDocument();

    await user.click(addButton);

    // ✔ EXPECT ĐÚNG: component gọi addToCart(id)
    expect(addToCart).toHaveBeenCalledWith('plant1');
  });

  it('should display counter when item is in the cart', async () => {
    const { addToCart, removeFromCart } = renderWithProviders({
      plant1: 2, // ✔ ĐÚNG: cartItems phải match id
    });
    const user = userEvent.setup();

    expect(screen.getByText('2')).toBeInTheDocument();

    const removeBtn = screen.getByAltText('remove');
    const addBtn = screen.getAllByAltText('add')[0];

    await user.click(removeBtn);
    expect(removeFromCart).toHaveBeenCalledWith('plant1');

    await user.click(addBtn);
    expect(addToCart).toHaveBeenCalledWith('plant1');
  });
});
