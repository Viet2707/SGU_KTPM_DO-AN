import React, { useContext } from "react";
import "./FoodItem.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../Context/StoreContext";
import { Link } from "react-router-dom";

const FoodItem = ({ id, image, name, price, desc }) => {
  const { cartItems, addToCart, removeFromCart, url, currency } =
    useContext(StoreContext);

  const itemCount = cartItems[id] || 0;

  return (
    <div className="food-item">
      <div className="food-item-img-container">
        {/* Link bao bọc hình ảnh */}
        <Link to={`/product/${id}`}>
          <img
            className="food-item-image"
            src={`${url}/images/${image}`}
            alt={name}
          />
        </Link>
        
        {/* Đặt các nút thêm/bớt vào đúng vị trí */}
        {itemCount === 0 ? (
          <img
            className="add"
            onClick={() => addToCart(id)}
            src={assets.add_icon_white}
            alt="add"
          />
        ) : (
          <div className="food-item-counter">
            <img
              src={assets.remove_icon_red}
              onClick={() => removeFromCart(id)}
              alt="remove"
            />
            <p>{itemCount}</p>
            <img
              src={assets.add_icon_green}
              onClick={() => addToCart(id)}
              alt="add"
            />
          </div>
        )}
      </div>

      <div className="food-item-info">
        <div className="food-item-name-rating">
          <p>{name}</p>
          <img src={assets.rating_starts} alt="rating" />
        </div>
        <p className="food-item-desc">{desc}</p>
        <p className="food-item-price">
          {price.toLocaleString('vi-VN')}{currency}
        </p>
      </div>
    </div>
  );
};

export default FoodItem;