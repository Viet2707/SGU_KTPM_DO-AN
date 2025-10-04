import React, { useContext, useState } from 'react';
import './LoginPopup.css';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../Context/StoreContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const LoginPopup = ({ setShowLogin }) => {

    const { setToken, url, loadCartData } = useContext(StoreContext);
    
    // ✅ SỬA 1: Dùng "Đăng nhập" làm trạng thái mặc định
    const [currState, setCurrState] = useState("Đăng nhập");

    const [data, setData] = useState({
        name: "",
        email: "",
        password: ""
    });

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData(data => ({ ...data, [name]: value }));
    };

    const onLogin = async (e) => {
        e.preventDefault();

        let endpoint = "";
        // ✅ SỬA 2: So sánh với "Đăng nhập" thay vì "Login"
        if (currState === "Đăng nhập") {
            endpoint = "/api/user/login";
        } else {
            endpoint = "/api/user/register";
        }
        
        const response = await axios.post(url + endpoint, data);

        if (response.data.success) {
            setToken(response.data.token);
            localStorage.setItem("token", response.data.token);
            loadCartData({ token: response.data.token });
            setShowLogin(false);
        } else {
            toast.error(response.data.message);
        }
    };

    return (
        <div className='login-popup'>
            <form onSubmit={onLogin} className="login-popup-container">
                <div className="login-popup-title">
                    <h2>{currState}</h2> 
                    <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="" />
                </div>
                <div className="login-popup-inputs">
                    {/* ✅ SỬA 3: So sánh với "Đăng ký" */}
                    {currState === "Đăng ký" ? 
                        <input name='name' onChange={onChangeHandler} value={data.name} type="text" placeholder='Tên của bạn' required /> 
                        : <></>
                    }
                    <input name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Email của bạn' required/>
                    <input name='password' onChange={onChangeHandler} value={data.password} type="password" placeholder='Mật khẩu' required />
                </div>
                {/* ✅ SỬA 4: So sánh với "Đăng nhập" */}
                <button type="submit">{currState === "Đăng nhập" ? "Đăng nhập" : "Tạo tài khoản"}</button>
                <div className="login-popup-condition">
                    <input type="checkbox" required/>
                    <p>Bằng cách tiếp tục, tôi đồng ý với các điều khoản sử dụng và chính sách bảo mật.</p>
                </div>
                {/* ✅ SỬA 5: So sánh với "Đăng nhập" và chuyển đổi trạng thái */}
                {currState === "Đăng nhập"
                    ? <p>Tạo tài khoản mới? <span onClick={() => setCurrState('Đăng ký')}>Chọn ở đây</span></p>
                    : <p>Bạn đã có tài khoản? <span onClick={() => setCurrState('Đăng nhập')}>Đăng nhập ở đây</span></p>
                }
            </form>
        </div>
    );
};

export default LoginPopup;