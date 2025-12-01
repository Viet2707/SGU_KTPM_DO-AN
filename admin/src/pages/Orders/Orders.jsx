/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import "./Orders.css";
import { toast } from "react-toastify";
import axios from "axios";
import { assets, url, currency } from "../../assets/assets";

const Order = () => {
  const [orders, setOrders] = useState([]);

  const formatMoney = (n) =>
    Number(n || 0).toLocaleString("vi-VN") + currency;

  const fetchAllOrders = async () => {
    try {
      const res = await axios.get(`${url}/api/order/list`);
      if (res.data?.success) {
        setOrders([...res.data.data].reverse());
      } else {
        toast.error(res.data?.message || "Không tải được đơn hàng");
      }
    } catch (e) {
      console.error(e);
      toast.error("Lỗi tải danh sách đơn hàng");
    }
  };

  const statusHandler = async (event, orderId) => {
    try {
      const next = event.target.value;
      const res = await axios.post(`${url}/api/order/status`, {
        orderId,
        status: next,
      });
      if (res.data?.success) {
        await fetchAllOrders();
        toast.success("Cập nhật trạng thái thành công");
      } else {
        toast.error(res.data?.message || "Cập nhật thất bại");
      }
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || "Lỗi server khi cập nhật trạng thái");
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  return (
    <div className="order add">
      <h3>Quản lý đơn hàng</h3>

      <div className="order-list">
        {orders.map((order) => {
          const addr = order.address || {};
          const orderCode = String(order._id || "").slice(-6);
         const isLocked = ["delivered", "canceled"].includes(
  (order.status || "").toLowerCase()
);


          return (
            <div key={order._id} className="order-card">
              <div className="order-card__header">
                <div className="order-code">
                  <img src={assets.parcel_icon} alt="" />
                  <span>Đơn #{orderCode}</span>
                </div>

                <div className="order-header-right">
                  <span className="badge badge--payment">
                    {order.payment ? "Đã thanh toán" : "Chưa thanh toán"}
                  </span>
                  <span className="badge badge--method">COD</span>
                  <span className="badge badge--items">
                    {order.items?.length || 0} món
                  </span>
                </div>
              </div>

              <div className="order-card__body">
                <div className="order-info">
                  <h4>Thông tin giao hàng</h4>

                  <div className="info-grid">
                    <div className="info-field">
                      <label>Họ và tên</label>
                      <div>
                        {(addr.firstName || "") + " " + (addr.lastName || "")}
                      </div>
                    </div>

                    <div className="info-field">
                      <label>Email</label>
                      <div>{addr.email || addr.mail || "—"}</div>
                    </div>

                    <div className="info-field">
                      <label>Số điện thoại</label>
                      <div>{addr.phone || "—"}</div>
                    </div>

                    <div className="info-field info-field--full">
                      <label>Địa chỉ</label>
                      <div>{addr.street || "—"}</div>
                    </div>

                    <div className="info-field">
                      <label>Thành phố / Tỉnh</label>
                      <div>{addr.city || "—"}</div>
                    </div>

                    <div className="info-field">
                      <label>Quận / Huyện</label>
                      <div>{addr.state || "—"}</div>
                    </div>

                    <div className="info-field">
                      <label>Quốc gia</label>
                      <div>{addr.country || "—"}</div>
                    </div>

                    <div className="info-field">
                      <label>Mã bưu chính</label>
                      <div>{addr.zipcode || "—"}</div>
                    </div>
                  </div>
                </div>

                <div className="order-summary">
                  <h4>Sản phẩm</h4>
                  <ul className="items-list">
                    {order.items?.map((it, idx) => (
                      <li key={idx} className="item-row">
                        <div className="item-main">
                          <span className="item-name">{it.name}</span>
                          <span className="item-qty">x {it.quantity}</span>
                        </div>
                        <div className="item-sub">
                          {formatMoney(Number(it.price) * Number(it.quantity))}
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="summary-line">
                    <span>Tổng tiền</span>
                    <strong>{formatMoney(order.amount)}</strong>
                  </div>

                  <div className="status-line">
                    <label>Trạng thái</label>

                    {/* CÁCH 1: disable select khi đã Delivered */}
                    <select
                      onChange={(e) => statusHandler(e, order._id)}
                      value={order.status}
                      disabled={isLocked}
                      role="combobox"
                    >
                      <option value="Food Processing">Food Processing</option>
                      <option value="Out for delivery">Out for delivery</option>
                      <option value="Delivered">Delivered</option>
                          <option value="Canceled">Canceled</option>

                    </select>

                    
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {orders.length === 0 && (
          <div className="empty-note">Chưa có đơn hàng nào.</div>
        )}
      </div>
    </div>
  );
};

export default Order;
