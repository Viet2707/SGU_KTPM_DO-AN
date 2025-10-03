import React, { useContext } from "react";
import "./FoodItem.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../Context/StoreContext";
import { Link } from "react-router-dom";

const FoodItem = ({ id, image, name, price, desc }) => {
  const { cartItems, addToCart, removeFromCart, url, currency } =
    useContext(StoreContext);

  return (
    <div className="food-item">
      {/* Bọc hình + tên bằng Link để dẫn sang ProductDetail */}
      <Link to={`/product/${id}`} className="food-item-link">
        <div className="food-item-img-container">
          <img
            className="food-item-image"
            src={`${url}/images/${image}`}
            alt={name}
          />
        </div>
      </Link>

      <div className="food-item-info">
        <div className="food-item-name-rating">
          <p>{name}</p>
          <img src={assets.rating_starts} alt="rating" />
        </div>
        <p className="food-item-desc">{desc}</p>
        <p className="food-item-price">
          {price.toLocaleString()}{currency}
        </p>
      </div>

      {/* Nút add/remove giỏ hàng */}
      <div className="food-item-actions">
        {!cartItems[id] ? (
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
            <p>{cartItems[id]}</p>
            <img
              src={assets.add_icon_green}
              onClick={() => addToCart(id)}
              alt="add"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodItem;