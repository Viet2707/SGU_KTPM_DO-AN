import { useContext, useEffect, useState } from "react";
import "./PlaceOrder.css";
import { StoreContext } from "../../Context/StoreContext";
import { assets } from "../../assets/assets";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const PlaceOrder = () => {
  // Chỉ còn COD, không cần state chọn phương thức
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });

  const {
    getTotalCartAmount,
    token,
    food_list,
    cartItems,
    url,
    setCartItems,
    currency,
    deliveryCharge,
  } = useContext(StoreContext);

  const navigate = useNavigate();

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  // Build danh sách item từ cart (không mutate food_list)
  const buildOrderItems = () => {
    const items = [];
    for (const prod of food_list) {
      const qty = cartItems[prod._id] || 0;
      if (qty > 0) {
        items.push({
          _id: prod._id,
          name: prod.name,
          price: Number(prod.price),
          quantity: qty,
          image: Array.isArray(prod.image) ? prod.image[0] : prod.image,
        });
      }
    }
    return items;
  };

  const placeOrder = async (e) => {
    e.preventDefault();

    const orderItems = buildOrderItems();
    if (!orderItems.length) {
      toast.error("Giỏ hàng trống");
      return;
    }

    const orderData = {
      address: data,
      items: orderItems,
      amount: getTotalCartAmount() + deliveryCharge,
    };

    try {
      const response = await axios.post(
        `${url}/api/order/placecod`,
        orderData,
        { headers: { token } }
      );

      if (response.data?.success) {
        setCartItems({});
        toast.success(response.data.message || "Đặt hàng thành công");
        navigate("/myorders");
      } else {
        toast.error(response.data?.message || "Có lỗi xảy ra");
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Lỗi máy chủ");
    }
  };

  useEffect(() => {
    if (!token) {
      toast.error("Hãy đăng nhập trước khi đặt hàng");
      navigate("/cart");
    } else if (getTotalCartAmount() === 0) {
      navigate("/cart");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <form onSubmit={placeOrder} className="place-order">
      <div className="place-order-left">
        <p className="title">Thông tin giao hàng</p>

        <div className="multi-field">
          <input
            type="text"
            name="firstName"
            onChange={onChangeHandler}
            value={data.firstName}
            placeholder="Tên"
            required
          />
          <input
            type="text"
            name="lastName"
            onChange={onChangeHandler}
            value={data.lastName}
            placeholder="Họ"
            required
          />
        </div>

        <input
          type="email"
          name="email"
          onChange={onChangeHandler}
          value={data.email}
          placeholder="Địa chỉ email"
          required
        />

        <input
          type="text"
          name="street"
          onChange={onChangeHandler}
          value={data.street}
          placeholder="Địa chỉ (Số nhà, tên đường, phường/xã)"
          required
        />

        <div className="multi-field">
          <input
            type="text"
            name="city"
            onChange={onChangeHandler}
            value={data.city}
            placeholder="Thành phố / Tỉnh"
            required
          />
          <input
            type="text"
            name="state"
            onChange={onChangeHandler}
            value={data.state}
            placeholder="Quận / Huyện"
            required
          />
        </div>

        <div className="multi-field">
          <input
            type="text"
            name="country"
            onChange={onChangeHandler}
            value={data.country}
            placeholder="Quốc gia"
            required
          />
          <input
            type="text"
            name="zipcode"
            onChange={onChangeHandler}
            value={data.zipcode}
            placeholder="Mã bưu chính (nếu có)"
          />
        </div>

        <input
          type="text"
          name="phone"
          onChange={onChangeHandler}
          value={data.phone}
          placeholder="Số điện thoại"
          required
        />
      </div>

      <div className="place-order-right">
        <div className="cart-total">
          <h2>Tổng đơn hàng</h2>
          <div>
            <div className="cart-total-details">
              <p>Tổng phụ</p>
              <p>
                {getTotalCartAmount().toLocaleString("vi-VN")}
                {currency}
              </p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Phí giao hàng</p>
              <p>
                {(getTotalCartAmount() === 0
                  ? 0
                  : deliveryCharge
                ).toLocaleString("vi-VN")}
                {currency}
              </p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Tổng tiền</b>
              <b>
                {(getTotalCartAmount() === 0
                  ? 0
                  : getTotalCartAmount() + deliveryCharge
                ).toLocaleString("vi-VN")}
                {currency}
              </b>
            </div>
          </div>
        </div>

        {/* Chỉ còn COD */}
        <div className="payment">
          <h2>Payment Method</h2>
          <div className="payment-option">
            <img src={assets.checked} alt="" />
            <p>COD ( Thanh toán khi nhận hàng )</p>
          </div>
        </div>

        <button className="place-order-submit" type="submit">
          Đặt hàng
        </button>
      </div>
    </form>
  );
};

export default PlaceOrder;
