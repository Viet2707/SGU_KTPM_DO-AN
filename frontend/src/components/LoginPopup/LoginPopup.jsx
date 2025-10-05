import  { useContext, useState } from 'react'
import PropTypes from 'prop-types'

import './LoginPopup.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../Context/StoreContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const LoginPopup = ({ setShowLogin }) => {

    const { setToken, url,loadCartData } = useContext(StoreContext)
    const [currState, setCurrState] = useState("Sign Up");

    const [data, setData] = useState({
        name: "",
        email: "",
        password: ""
    })

    const onChangeHandler = (event) => {
        const name = event.target.name
        const value = event.target.value
        setData(data => ({ ...data, [name]: value }))
    }

   const onLogin = async (e) => {
  e.preventDefault();

  try {
    let new_url = url;
    let response;

    // ---- 1. Thử đăng nhập admin trước ----
    try {
      response = await axios.post(`${url}/api/admin/login`, data);
      if (response.data.success) {
        // ✅ Nếu là admin
        localStorage.setItem("admin_token", response.data.token);
        toast.success("Đăng nhập admin thành công!");
        // Chuyển sang trang admin (port 5174)
// sau khi nhận được res.data.token
    const t = encodeURIComponent(response.data.token);
window.location.href = `http://localhost:5174/list?token=${t}`;
        return;
      }
    } catch (err) {
      //   const msg = err?.response?.data?.message || "Lỗi kết nối máy chủ";

      // toast.error(msg); // 👈 nếu bị khóa: "Tài khoản đã bị khóa…"

    }
  

    // ---- 2. Nếu không phải admin => đăng nhập user bình thường ----
    if (currState === "Login") {
      new_url += "/api/user/login";
    } else {
      new_url += "/api/user/register";
    }

    response = await axios.post(new_url, data);

    if (response.data.success) {
      setToken(response.data.token);
      localStorage.setItem("token", response.data.token);
      loadCartData({ token: response.data.token });
      setShowLogin(false);
      toast.success("Đăng nhập thành công!");
    } else {
      toast.error(response.data.message);
    }

  } catch (error) {
    toast.error("Lỗi kết nối máy chủ");
    console.error(error);
    
  }
};

    return (
        <div className='login-popup'>
            <form onSubmit={onLogin} className="login-popup-container">
                <div className="login-popup-title">
                    <h2>{currState}</h2> <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="" />
                </div>
                <div className="login-popup-inputs">
                    {currState === "Sign Up" ? <input name='name' onChange={onChangeHandler} value={data.name} type="text" placeholder='Your name' required /> : <></>}
                    <input name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Your email' />
                    <input name='password' onChange={onChangeHandler} value={data.password} type="password" placeholder='Password' required />
                </div>
                <button>{currState === "Login" ? "Login" : "Create account"}</button>
                <div className="login-popup-condition">
                    <input type="checkbox" name="" id="" required/>
                    <p>By continuing, i agree to the terms of use & privacy policy.</p>
                </div>
                {currState === "Login"
                    ? <p>Create a new account? <span onClick={() => setCurrState('Sign Up')}>Click here</span></p>
                    : <p>Already have an account? <span onClick={() => setCurrState('Login')}>Login here</span></p>
                }
            </form>
        </div>
    )
}

export default LoginPopup
LoginPopup.propTypes = {
  setShowLogin: PropTypes.func,
}
