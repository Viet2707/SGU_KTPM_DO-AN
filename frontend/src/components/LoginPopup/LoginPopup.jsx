import { useContext, useState } from 'react'
import PropTypes from 'prop-types'

import './LoginPopup.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../Context/StoreContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const LoginPopup = ({ setShowLogin }) => {

    const { setToken, url, loadCartData } = useContext(StoreContext)
    const [currState, setCurrState] = useState("Đăng ký");

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
                    
                    // 🔥 AUTO DETECT PORT - hoạt động cả dev và Docker
                    const { protocol, hostname } = window.location;
                    const frontendPort = window.location.port;
                    let adminPort;
                    
                    if (frontendPort === "5173" || frontendPort === "") {
                        // Dev environment
                        adminPort = "5174";
                    } else if (frontendPort === "8080") {
                        // Docker environment
                        adminPort = "8081";
                    } else {
                        // Fallback: tăng port lên 1
                        adminPort = (parseInt(frontendPort) + 1).toString();
                    }
                    
                    const adminUrl = `${protocol}//${hostname}:${adminPort}`;
                    const t = encodeURIComponent(response.data.token);
                    
                    console.log("🔍 Frontend port:", frontendPort);
                    console.log("🔍 Redirecting to admin:", adminUrl);
                    
                    window.location.href = `${adminUrl}/?token=${t}`;
                    return;
                }
            } catch (err) {
                // Không hiển thị lỗi nếu không phải admin
            }

            // ---- 2. Nếu không phải admin => đăng nhập user bình thường ----
            if (currState === "Đăng nhập") {
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
            console.error(error);
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
                    {currState === "Đăng ký" ?
                        <input name='name' onChange={onChangeHandler} value={data.name} type="text" placeholder='Tên của bạn' required />
                        : <></>
                    }
                    <input name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Email của bạn' required />
                    <input name='password' onChange={onChangeHandler} value={data.password} type="password" placeholder='Mật khẩu' required />
                </div>
                <button type="submit">{currState === "Đăng nhập" ? "Đăng nhập" : "Tạo tài khoản"}</button>
                
                {currState === "Đăng nhập"
                    ? <p>Tạo tài khoản mới? <span onClick={() => setCurrState('Đăng ký')}>Chọn ở đây</span></p>
                    : <p>Bạn đã có tài khoản? <span onClick={() => setCurrState('Đăng nhập')}>Đăng nhập ở đây</span></p>
                }
            </form>
        </div>
    );
};

export default LoginPopup;

LoginPopup.propTypes = {
    setShowLogin: PropTypes.func,
}