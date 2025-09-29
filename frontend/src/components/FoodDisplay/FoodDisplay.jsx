/* eslint-disable no-unused-vars */

import React, { useContext, useMemo } from 'react'
import './FoodDisplay.css'
import FoodItem from '../FoodItem/FoodItem'
import { StoreContext } from '../../Context/StoreContext'
import PropTypes from 'prop-types';

/**
 * Props:
 * - category: string ("All" | tên danh mục)
 * - minPrice?: number | ''   // giá từ
 * - maxPrice?: number | ''   // giá đến
 */
const FoodDisplay = ({ category, minPrice = '', maxPrice = '' }) => {
  const { food_list } = useContext(StoreContext);

  // chuẩn hóa category
  const normalizedCategory = (category || 'All').trim().toLowerCase();

  // lọc theo danh mục + khoảng giá (dùng useMemo để không lọc lại vô ích)
  const filteredList = useMemo(() => {
    const list = Array.isArray(food_list) ? food_list : [];

    return list.filter((item) => {
      // --- lọc theo danh mục ---
      const itemCat = (item.category || '').trim().toLowerCase();
      const inCat =
        normalizedCategory === 'all' || itemCat === normalizedCategory;

      // --- lọc theo giá ---
      const priceNum = Number(item.price);
      const okMin = minPrice === '' || priceNum >= Number(minPrice);
      const okMax = maxPrice === '' || priceNum <= Number(maxPrice);

      return inCat && okMin && okMax;
    });
  }, [food_list, normalizedCategory, minPrice, maxPrice]);

  return (
    <div className='food-display' id='food-display'>
      <h2>
        Danh sách cây {normalizedCategory === 'all' ? '- Tất cả sản phẩm' : `- ${category}`}
        {(minPrice !== '' || maxPrice !== '') && (
          <span style={{ fontWeight: 400, fontSize: 14, marginLeft: 8 }}>
            ({minPrice !== '' ? `từ ${Number(minPrice).toLocaleString()}đ` : ''}
            {minPrice !== '' && maxPrice !== '' ? ' - ' : ''}
            {maxPrice !== '' ? `đến ${Number(maxPrice).toLocaleString()}đ` : ''})
          </span>
        )}
      </h2>

      <div className='food-display-list'>
        {!food_list || food_list.length === 0 ? (
          <p>Đang tải sản phẩm...</p>
        ) : filteredList.length === 0 ? (
          <p>Không có sản phẩm phù hợp bộ lọc</p>
        ) : (
          filteredList.map((item) => (
            <FoodItem
              key={item._id}
              image={item.image}
              name={item.name}
              desc={item.description}
              price={item.price}
              id={item._id}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default FoodDisplay
FoodDisplay.propTypes = {
  category: PropTypes.string.isRequired,
  minPrice: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string
  ]),
  maxPrice: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string
  ]),
};

