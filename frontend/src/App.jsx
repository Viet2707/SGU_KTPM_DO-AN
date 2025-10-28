import { useState, useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";

import Home from './pages/Home/Home';
import Cart from './pages/Cart/Cart';
import PlaceOrder from './pages/PlaceOrder/PlaceOrder';
import MyOrders from './pages/MyOrders/MyOrders';
import OrderDetail from './pages/OrderDetail/OrderDetail';
import Verify from './pages/Verify/Verify';
import ProductDetail from './pages/ProductDetail/ProductDetail';

import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import LoginPopup from './components/LoginPopup/LoginPopup';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("logout") === "true") {
      console.log("Logout signal detected from admin.");
      localStorage.removeItem("token");   // xoá token Buyer
      localStorage.removeItem("cart");
      localStorage.removeItem("admin_token");
    // xoá giỏ hàng nếu có
      setShowLogin(false);                // tắt popup login nếu đang bật
      navigate("/");                      // quay về trang chủ Buyer
    }
  }, [navigate]);

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} />
      {showLogin && <LoginPopup setShowLogin={setShowLogin} />}
      <div className="app">
        <Navbar setShowLogin={setShowLogin} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/order" element={<PlaceOrder />} />
          <Route path="/myorders" element={<MyOrders />} />
          <Route path="/order/:orderId" element={<OrderDetail />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          {/* Nếu deploy riêng admin SPA thì KHÔNG cần import ở đây */}
          {/* <Route path="/admin-login" element={<AdminLogin />} /> */}
          {/* Fallback route */}
          <Route path="*" element={<h2 style={{textAlign:'center'}}>404 - Page Not Found</h2>} />
        </Routes>
      </div>
      <Footer />
    </>
  );
};

export default App;
