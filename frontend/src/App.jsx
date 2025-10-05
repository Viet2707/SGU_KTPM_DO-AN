import  { useState, useEffect } from "react";
import Home from './pages/Home/Home'
import Footer from './components/Footer/Footer'
import Navbar from './components/Navbar/Navbar'
import { Route, Routes } from 'react-router-dom'
import Cart from './pages/Cart/Cart'
import LoginPopup from './components/LoginPopup/LoginPopup'
import PlaceOrder from './pages/PlaceOrder/PlaceOrder'
import MyOrders from './pages/MyOrders/MyOrders'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Verify from './pages/Verify/Verify'
import ProductDetail from './pages/ProductDetail/ProductDetail'
// import AdminLogin from './pages/AdminLogin/AdminLogin'  // ✅ import AdminLogin
import OrderDetail from './pages/OrderDetail/OrderDetail'

const App = () => {

  const [showLogin,setShowLogin] = useState(false);

    useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("logout") === "true") {
      console.log("Logout signal detected from admin.");
      localStorage.removeItem("token"); // xoá token user
      localStorage.removeItem("cart");  // nếu bạn có lưu giỏ hàng
      // có thể reload để cập nhật Navbar, MyOrders,...
      window.location.replace("http://localhost:5173/");
    }
  }, []);

  

  return (
    <>
    <ToastContainer/>
    {showLogin?<LoginPopup setShowLogin={setShowLogin}/>:<></>}
      <div className='app'>
        <Navbar setShowLogin={setShowLogin}/>
        <Routes>
          <Route path='/' element={<Home />}/>
          <Route path='/cart' element={<Cart />}/>
          <Route path='/order' element={<PlaceOrder />}/>
          <Route path='/myorders' element={<MyOrders />}/>
          <Route path='/order/:orderId' element={<OrderDetail />}/> {/* ✅ thêm route chi tiết đơn hàng */}
          <Route path='/verify' element={<Verify />}/>
          <Route path='/product/:id' element={<ProductDetail />}/>     
            {/* <Route path='/admin-login' element={<AdminLogin />} />   ✅ thêm dòng này */}
   
        </Routes>
      </div>
      <Footer />
    </>
  )
}

export default App

