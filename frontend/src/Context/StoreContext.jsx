// src/Context/StoreContext.jsx
import { createContext, useEffect, useState } from "react";
import { menu_list } from "../assets/assets";
import axios from "axios";
import PropTypes from "prop-types";
import { toast } from "react-toastify";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const url = "http://localhost:5000";
  const [food_list, setFoodList] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [token, setToken] = useState("");
  const currency = "vnđ";
  const deliveryCharge = 50000;

  // --- Đăng xuất user: xóa token + state giỏ ---
  const logoutUser = (msg) => {
    try {
      localStorage.removeItem("token");
    } catch (e) {
      console.error("Failed to remove token from localStorage:", e);
    }
    setToken("");
    setCartItems({});
    if (msg) {
      // hiện thông báo nếu có message
      toast.error(msg);
    }
  };

  // --- Thiết lập axios defaults + interceptors ---
  useEffect(() => {
    // gửi token mặc định cho axios (nếu có)
    if (token) {
      axios.defaults.headers.common["token"] = token; // backend của bạn đang đọc headers.token
      // Nếu muốn dùng Authorization Bearer, bật dòng dưới (và sửa backend đọc Authorization)
      // axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["token"];
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  useEffect(() => {
    // Interceptor: bắt lỗi 401/403 toàn cục -> tự logout
    const resInterceptor = axios.interceptors.response.use(
      (res) => res,
      (error) => {
        const status = error?.response?.status;
        const message = error?.response?.data?.message || "";

        // Nếu bị khóa tài khoản từ bất kỳ API bảo vệ nào
        if (status === 403 && message.toLowerCase().includes("bị khóa")) {
          logoutUser("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.");
          return Promise.reject(error);
        }

        // Token hết hạn / không hợp lệ -> đăng xuất
        if (status === 401) {
          // logoutUser("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          return Promise.reject(error);
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(resInterceptor);
    };
  }, []);

  // --- API helpers ---
  const addToCart = async (itemId, quantity = 1) => {
    setCartItems((prev) => {
      const currentQty = prev[itemId] || 0;
      return { ...prev, [itemId]: currentQty + quantity };
    });

    if (token) {
      await axios.post(url + "/api/cart/add", { itemId, quantity });
    }
  };

  const removeFromCart = async (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: Math.max((prev[itemId] || 0) - 1, 0) }));
    if (token) {
      await axios.post(url + "/api/cart/remove", { itemId });
    }
  };

  const removeItemCompletely = async (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: 0 }));
    if (token) {
      await axios.post(url + "/api/cart/remove-all", { itemId });
    }
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      try {
        if (cartItems[item] > 0) {
          const itemInfo = food_list.find((product) => product._id === item);
          if (itemInfo) {
            totalAmount += itemInfo.price * cartItems[item];
          }
        }
      } catch (error) {
        console.error(`Error calculating total for item ${item}:`, error);
      }
    }
    return totalAmount;
  };

  const fetchFoodList = async () => {
    const response = await axios.get(url + "/api/food/list");
    setFoodList(response.data.data || []);
  };

  const loadCartData = async (hdr) => {
    const response = await axios.post(url + "/api/cart/get", {}, { headers: hdr });
    setCartItems(response.data.cartData || {});
  };

  // --- Khởi tạo: bắt ?logout, fetch list, hồi phục token ---
  useEffect(() => {
    async function loadData() {
      // 1) Bắt tín hiệu logout qua query
      const params = new URLSearchParams(window.location.search);
      const isLogout =
        params.get("logout") === "1" ||
        params.get("logout") === "true" ||
        window.location.pathname === "/logout=true";

      if (isLogout) {
        logoutUser();
        // dọn URL
        window.history.replaceState({}, "", "/");
      }

      // 2) Fetch danh sách sản phẩm
      await fetchFoodList();

      // 3) Hồi phục token nếu còn
      const saved = localStorage.getItem("token");
      if (saved) {
        setToken(saved);
        await loadCartData({ token: saved });
      }
    }
    loadData();
  }, []);

  // --- Polling kiểm tra trạng thái tài khoản: auto-logout nếu bị khóa khi đang online ---
  useEffect(() => {
    if (!token) return;

    let stop = false;

    const checkStatus = async () => {
      try {
        const res = await axios.get(url + "/api/user/status"); // middleware auth sẽ đọc headers.token
        // server có thể trả { success:true, status:"lock"/"unlock" }
        const status = res?.data?.status;
        if (status && status.toLowerCase() === "lock") {
          logoutUser("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.");
        }
      } catch (err) {
        const status = err?.response?.status;
        const msg = err?.response?.data?.message || "";
        // nếu middleware trả 403 do bị khóa, interceptor đã lo — phòng hờ vẫn check thêm:
        if (status === 403 || msg.toLowerCase().includes("bị khóa")) {
          // logoutUser("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.");
        }
      }
      if (!stop) {
        // kiểm tra lại sau 30s
        setTimeout(checkStatus, 30000);
      }
    };

    checkStatus();
    return () => {
      stop = true;
    };
  }, [token]);

  const contextValue = {
    url,
    food_list,
    menu_list,
    cartItems,
    addToCart,
    removeFromCart,
    removeItemCompletely,
    getTotalCartAmount,
    token,
    setToken,
    loadCartData,
    setCartItems,
    currency,
    deliveryCharge,
    logoutUser,
  };

  return <StoreContext.Provider value={contextValue}>{props.children}</StoreContext.Provider>;
};

export default StoreContextProvider;

StoreContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
