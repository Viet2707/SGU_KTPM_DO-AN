import React, { useContext, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ProductDetail.css";
import { StoreContext } from "../../Context/StoreContext";
import axios from "axios";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { food_list, url, currency, addToCart } = useContext(StoreContext);

  // Lấy sản phẩm theo id
  const product = useMemo(
    () => food_list.find((item) => item._id === id),
    [food_list, id]
  );

  const [quantity, setQuantity] = useState(1);
  const [stock, setStock] = useState(null);       // số lượng tồn hiện tại
  const [loadingStock, setLoadingStock] = useState(true);

  // Lấy tồn kho lúc mở trang
  useEffect(() => {
    let alive = true;
    const fetchStock = async () => {
      try {
        setLoadingStock(true);
        const { data } = await axios.get(`${url}/api/stocks/available/${id}`);
        if (!alive) return;
        const qty = data?.quantity ?? 0;
        setStock(qty);
        setQuantity((q) => Math.max(1, Math.min(q, qty || 1)));
      } catch (e) {
        if (!alive) return;
        setStock(0);
      } finally {
        if (alive) setLoadingStock(false);
      }
    };
    if (id) fetchStock();
    return () => { alive = false; };
  }, [id, url]);

  if (!product) {
    return (
      <h2 style={{ textAlign: "center", marginTop: "50px" }}>
        Sản phẩm không tồn tại!
      </h2>
    );
  }

  // Refresh tồn kho ngay trước khi thêm/mua để tránh lệch số liệu
  const refreshStock = async () => {
    try {
      const { data } = await axios.get(`${url}/api/stocks/available/${id}`);
      const qty = data?.quantity ?? 0;
      setStock(qty);
      return qty;
    } catch {
      setStock(0);
      return 0;
    }
  };

  const alertQty = (msg) => window.alert(msg);

  // Thêm vào giỏ
  const handleAdd = async () => {
    const available = await refreshStock();
    if (available <= 0) return alertQty("Kho còn 0 sản phẩm");
    if (quantity > available) {
      setQuantity(Math.max(1, Math.min(quantity, available)));
      return alertQty(`Chỉ còn ${available} sản phẩm`);
    }
    addToCart(product._id, quantity);
  };

  // Mua ngay
  const handleBuyNow = async () => {
    const available = await refreshStock();
    if (available <= 0) return alertQty("Kho còn 0 sản phẩm");
    if (quantity > available) {
      setQuantity(Math.max(1, Math.min(quantity, available)));
      return alertQty(`Chỉ còn ${available} sản phẩm`);
    }
    addToCart(product._id, quantity);
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
            src={`${url}/images/${product.image}`}
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

          {/* Hiển thị tồn kho đơn giản */}
          <div className="product-detail-stock">
            <span>Tồn kho: </span>
            {loadingStock ? (
              <b>Đang kiểm tra...</b>
            ) : (
              <b>{stock ?? 0}</b>
            )}
          </div>

          {/* Bộ chọn số lượng */}
          <div className="product-detail-quantity">
            <p>Số lượng:</p>
            <div className="quantity-control">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="btn-qty"
                disabled={loadingStock}
              >
                -
              </button>
              <span>{quantity}</span>
              <button
                onClick={() =>
                  setQuantity((q) => (stock != null ? Math.min(q + 1, stock) : q + 1))
                }
                className="btn-qty"
                disabled={loadingStock || (stock != null && quantity >= stock)}
              >
                +
              </button>
            </div>
            {!loadingStock && stock != null && quantity >= stock && stock > 0 && (
              <small style={{ color: "#f57c00" }}>
                Chỉ còn {stock} sản phẩm
              </small>
            )}
          </div>

          {/* Nút hành động */}
          <div className="product-detail-actions">
            <button
              className="btn-add"
              onClick={handleAdd}
              disabled={loadingStock || (stock !== null && stock <= 0)}
            >
              🛒 Thêm vào giỏ
            </button>
            <button
              className="btn-buy"
              onClick={handleBuyNow}
              disabled={loadingStock || (stock !== null && stock <= 0)}
            >
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
              - Tồn kho: {loadingStock ? "Đang kiểm tra..." : (stock ?? 0)} <br />
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
              <img src={`${url}/images/${item.image}`} alt={item.name} />
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