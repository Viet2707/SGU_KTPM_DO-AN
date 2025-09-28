/* eslint-disable no-unused-vars */

import React, { useContext } from 'react'
import './ExploreMenu.css'
import { StoreContext } from '../../Context/StoreContext'
import PropTypes from 'prop-types'

/**
 * Props đề xuất:
 * - category, setCategory: đang có sẵn
 * - minPrice, setMinPrice: number | ''  (giá từ)
 * - maxPrice, setMaxPrice: number | ''  (giá đến)
 * - onApplyPrices?: optional callback khi bấm "Áp dụng"
 */
const ExploreMenu = ({
  category, setCategory,
  minPrice, setMinPrice,
  maxPrice, setMaxPrice,
  onApplyPrices, // không bắt buộc
}) => {
  const { menu_list } = useContext(StoreContext);

  const handleApply = (e) => {
    e.preventDefault();
    // Nếu có callback từ cha thì gọi, còn không thì thôi (đã set state qua onChange rồi)
    if (typeof onApplyPrices === 'function') onApplyPrices({ minPrice, maxPrice });
  };

  return (
    <div className='explore-menu' id='explore-menu'>
      <h1>Hãy lựa chọn sản phẩm </h1>
      <p className='explore-menu-text'>
        Mỗi bông hoa mang một câu chuyện tình yêu, nhẹ nhàng nhưng sâu sắc như trái tim bạn.
      </p>

      {/* Danh mục */}
      <div className="explore-menu-list">
        {menu_list.map((item, index) => (
          <div
            onClick={() => setCategory(prev => prev === item.menu_name ? "All" : item.menu_name)}
            key={index}
            className='explore-menu-list-item'
          >
            <img
              src={item.menu_image}
              className={category === item.menu_name ? "active" : ""}
              alt={item.menu_name}
            />
            <p>{item.menu_name}</p>
          </div>
        ))}
      </div>

      {/* --- Bộ lọc theo giá --- */}
      <form className="price-filter" onSubmit={handleApply}>
        <div className="price-field">
          <label>Giá từ</label>
          <input
            type="number"
            min="0"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0"
          />
        </div>
        <div className="price-sep">—</div>
        <div className="price-field">
          <label>Đến</label>
          <input
            type="number"
            min="0"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="1000000"
          />
        </div>
        <button type="submit" className="apply-btn">Áp dụng</button>
      </form>

      <hr />
    </div>
  )
}

export default ExploreMenu

ExploreMenu.propTypes = {
  category: PropTypes.string.isRequired,
  setCategory: PropTypes.func.isRequired,
  minPrice: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string
  ]).isRequired,
  setMinPrice: PropTypes.func.isRequired,
  maxPrice: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string
  ]).isRequired,
  setMaxPrice: PropTypes.func.isRequired,
  onApplyPrices: PropTypes.func,
};
