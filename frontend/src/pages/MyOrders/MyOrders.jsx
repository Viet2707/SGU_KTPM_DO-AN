import  { useContext, useEffect, useState } from 'react';
import './MyOrders.css';
import axios from 'axios';
import { StoreContext } from '../../Context/StoreContext';
import { assets } from '../../assets/assets';
import { Link } from 'react-router-dom'; // ✅ BƯỚC 1: Import Link từ react-router-dom

const MyOrders = () => {
  
  const [data, setData] = useState([]);
  const { url, token, currency } = useContext(StoreContext);

  const fetchOrders = async () => {
    try {
      const response = await axios.post(url + "/api/order/userorders", {}, { headers: { token } });
      if (response.data.success) {
        setData(response.data.data);
      } else {
        // Xử lý trường hợp API trả về success: false
        console.error("Lỗi khi tải lịch sử đơn hàng:", response.data.message);
      }
    } catch (error) {
      // Xử lý lỗi mạng hoặc lỗi server
      console.error("Đã có lỗi xảy ra:", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  return (
    <div className='my-orders'>
      <h2>My Orders</h2>
      <div className="container">
        {data.length === 0 ? (
          <p>Bạn chưa có đơn hàng nào.</p>
        ) : (
          data.map((order, index) => {
            return (
              <div key={index} className='my-orders-order'>
                  <img src={assets.parcel_icon} alt="" />
                  <p>{order.items.map((item, idx) => {
                    // Cải thiện logic nối chuỗi một chút
                    return `${item.name} x ${item.quantity}${idx === order.items.length - 1 ? '' : ', '}`;  
                  })}</p>
                  <p>{order.amount.toLocaleString('vi-VN')}{currency}</p>
                  <p>Items: {order.items.length}</p>
                  <p>
                    <span className='dot'>&#x25cf;</span> 
                    <b className={`status ${order.status.replace(/\s+/g, '-').toLowerCase()}`}>{order.status}</b>
                  </p>
  <button onClick={fetchOrders}>Track Order</button>
                  {/* ✅ BƯỚC 2: Thay thế <button> bằng <Link> */}
                  <Link to={`/order/${order._id}`}>
                    <button className='track-button'>Xem chi tiết</button>                    
                  </Link>
                 

              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default MyOrders;