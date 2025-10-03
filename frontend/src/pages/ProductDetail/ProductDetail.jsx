import React, { useContext, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ProductDetail.css";
import { StoreContext } from "../../Context/StoreContext";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { food_list, url, currency, addToCart } = useContext(StoreContext);

  const [quantity, setQuantity] = useState(1);

  const product = food_list.find((item) => item._id === id);

  if (!product) {
    return (
      <h2 style={{ textAlign: "center", marginTop: "50px" }}>
        Sản phẩm không tồn tại!
      </h2>
    );
  }

  // Hàm xử lý "Mua ngay"
  const handleBuyNow = () => {
    addToCart(product._id, quantity); // thêm với số lượng đã chọn
    navigate("/order");
  };

  // Gợi ý sản phẩm (3 sản phẩm khác)
  const relatedProducts = food_list
    .filter((item) => item._id !== product._id)
    .slice(0, 3);

  return (
    <>
      <div className="product-detail">
        {/* Cột trái - ảnh sản phẩm */}
        <div className="product-detail-left">
          <img
            className="product-detail-image"
            src={url + "/images/" + product.image}
            alt={product.name}
          />
        </div>

        {/* Cột phải - thông tin */}
        <div className="product-detail-right">
          <h1>{product.name}</h1>

          {/* Đánh giá & lượt bán */}
          <div className="product-detail-rating">
            <span>⭐⭐⭐⭐☆ (4.5)</span>
            <p>| Đã bán 1.2k</p>
          </div>

          <p className="product-detail-price">
            {currency}
            {product.price.toLocaleString()}
          </p>

          <p className="product-detail-desc">{product.description}</p>

          {/* Bộ chọn số lượng */}
          <div className="product-detail-quantity">
            <p>Số lượng:</p>
            <div className="quantity-control">
              <button
                onClick={() => setQuantity((q) => (q > 1 ? q - 1 : 1))}
                className="btn-qty"
              >
                -
              </button>
              <span>{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="btn-qty"
              >
                +
              </button>
            </div>
          </div>

          {/* Nút hành động */}
          <div className="product-detail-actions">
            <button
              className="btn-add"
              onClick={() => addToCart(product._id, quantity)}
            >
              🛒 Thêm vào giỏ
            </button>
            <button className="btn-buy" onClick={handleBuyNow}>
              ⚡ Mua ngay
            </button>
          </div>

          {/* Mô tả chi tiết */}
          <div className="product-detail-extra">
            <h2>Chi tiết sản phẩm</h2>
            <p>
              Đây là loại <b>{product.name}</b> rất được ưa chuộng.
              <br />
              - Xuất xứ: Việt Nam <br />
              - Kích thước: Trung bình (20 - 30cm) <br />
              - Tình trạng: Còn hàng <br />
              - Bảo hành: 7 ngày đổi trả <br />
              <br />
              {product.description} Sản phẩm phù hợp để làm quà tặng, trang trí
              không gian sống hoặc đặt tại văn phòng, mang lại cảm giác tươi mới
              và may mắn.
            </p>
          </div>
        </div>
      </div>

      {/* Gợi ý sản phẩm */}
      <div className="related-products">
        <h2>Gợi ý cho bạn</h2>
        <div className="related-grid">
          {relatedProducts.map((item) => (
            <div key={item._id} className="related-item">
              <img src={url + "/images/" + item.image} alt={item.name} />
              <h3>{item.name}</h3>
              <p className="price">
                {currency}
                {item.price.toLocaleString()}
              </p>
              <button
                className="btn-view"
                onClick={() => navigate(`/product/${item._id}`)}
              >
                Xem chi tiết
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ProductDetail;
