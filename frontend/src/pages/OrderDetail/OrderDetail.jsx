// src/pages/OrderDetail/OrderDetail.jsx
import  { useEffect, useState, useContext } from 'react';
// ✅ BƯỚC 1: Import thêm useNavigate
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { StoreContext } from '../../Context/StoreContext';
import './OrderDetail.css'; 
// import { assets } from '../../assets/assets';

const OrderDetail = () => {
  const { url } = useContext(StoreContext);
  const { orderId } = useParams(); 
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const {currency,deliveryCharge} = useContext(StoreContext);
  
  // ✅ BƯỚC 2: Khởi tạo hook useNavigate
  const navigate = useNavigate();

  useEffect(() => {
    // ... hàm fetchOrderDetail của bạn giữ nguyên ...
    const fetchOrderDetail = async () => {
      try {
        const response = await axios.get(`${url}/api/order/${orderId}`);
        if (response.data.success) {
          setOrder(response.data.data);
        } else {
          console.error(response.data.message);
        }
      } catch (error) {
        console.error("Lỗi khi tải chi tiết đơn hàng");
      }
      setLoading(false);
    };

    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId, url]);

  if (loading) {
    return <p>Đang tải chi tiết đơn hàng...</p>;
  }

  if (!order) {
    return <p>Không tìm thấy thông tin đơn hàng.</p>;
  }

  return (
    <div className='order-detail-page'>
      <div className="order-detail-header">
        <h2>Chi tiết đơn hàng #{order._id.slice(-6)}</h2>
        
        {/* ✅ BƯỚC 3: Thêm nút Quay lại */}
        <button className='back-button' onClick={() => navigate('/myorders')}>
          &larr; Quay lại danh sách
        </button>
      </div>

      <div className='order-detail-container'>
        <div className="order-detail-left">
          {/* ... phần JSX hiển thị sản phẩm giữ nguyên ... */}
          <h3>Các sản phẩm</h3>
          <div className="order-items-list">
            {order.items.map((item, index) => (
              <div key={index} className="order-item-detail">
                <img src={`${url}/images/${item.image}`} alt={item.name} />
                <p>{item.name}</p>
                <p>x {item.quantity}</p>
                <p>{(item.price * item.quantity).toLocaleString('vi-VN')}{currency}</p>
              </div>
            ))}
          </div>
          <hr />
            <div className="cart-total-details"><p>Phí giao hàng</p><p>{ deliveryCharge.toLocaleString('vi-VN')}{currency}</p></div>
            <hr />
          <hr />
          <p className='order-total'><strong>Tổng tiền:</strong> {order.amount.toLocaleString('vi-VN')}{currency}</p>
        </div>
        <div className="order-detail-right">
          {/* ... phần JSX hiển thị thông tin giao hàng giữ nguyên ... */}
          <h3>Thông tin giao hàng</h3>
          <p><strong>Người nhận:</strong> {order.address.firstName} {order.address.lastName}</p>
          <p><strong>Số điện thoại:</strong> {order.address.phone}</p>
          <p><strong>Địa chỉ:</strong> {order.address.street}, {order.address.city}, {order.address.state}</p>
          <div className="order-status-section">
            <h3>Trạng thái đơn hàng</h3>
            <p className={`status ${order.status.replace(/\s+/g, '-').toLowerCase()}`}>
              {order.status}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;