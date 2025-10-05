// src/Context/StoreContext.jsx
import { createContext, useEffect, useState } from "react";
import { menu_list } from "../assets/assets";
import axios from "axios";
import PropTypes from "prop-types";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const url = "http://localhost:5000";
  const [food_list, setFoodList] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [token, setToken] = useState("");
  const currency = ".000 vnđ";
  const deliveryCharge = 50;

  // 🔹 Đăng xuất user tại 5173
  const logoutUser = () => {
    try {
      localStorage.removeItem("token"); 
    } catch (e) {
      // Ghi log thay vì để block rỗng để tránh cảnh báo ESLint no-empty
      console.error("Failed to remove token from localStorage:", e);
    }
    setToken("");     // xoá state token
    setCartItems({}); // xoá giỏ
  };

  const addToCart = async (itemId, quantity = 1) => {
    setCartItems((prev) => {
      const currentQty = prev[itemId] || 0;
      return { ...prev, [itemId]: currentQty + quantity };
    });

    if (token) {
      await axios.post(
        url + "/api/cart/add",
        { itemId, quantity },
        { headers: { token } }
      );
    }
  };

  const removeFromCart = async (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
    if (token) {
      await axios.post(url + "/api/cart/remove", { itemId }, { headers: { token } });
    }
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      try {
        if (cartItems[item] > 0) {
          const itemInfo = food_list.find((product) => product._id === item);
          totalAmount += itemInfo.price * cartItems[item];
        }
      } catch (error) {
        console.error(`Error calculating total for item ${item}:`, error);
      }
    }
    return totalAmount;
  };

  const fetchFoodList = async () => {
    const response = await axios.get(url + "/api/food/list");
    setFoodList(response.data.data);
  };

  const loadCartData = async (hdr) => {
    const response = await axios.post(url + "/api/cart/get", {}, { headers: hdr });
    setCartItems(response.data.cartData);
  };

  useEffect(() => {
    async function loadData() {
      // ✅ 1) BẮT TÍN HIỆU LOGOUT TRƯỚC KHI ĐỌC TOKEN
      const params = new URLSearchParams(window.location.search);

      // hỗ trợ cả trường hợp lỡ vào "/logout=true"
      const isLogout =
        params.get("logout") === "1" ||
        params.get("logout") === "true" ||
        window.location.pathname === "/logout=true";

      if (isLogout) {
        logoutUser();
        // dọn URL để tránh xử lý lại khi refresh
        window.history.replaceState({}, "", "/");
      }

      // ✅ 2) Sau đó mới fetch & hồi phục session nếu còn
      await fetchFoodList();

      const saved = localStorage.getItem("token");
      if (saved) {
        setToken(saved);
        await loadCartData({ token: saved });
      }
    }
    loadData();
  }, []);

  const contextValue = {
    url,
    food_list,
    menu_list,
    cartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    token,
    setToken,
    loadCartData,
    setCartItems,
    currency,
    deliveryCharge,
    logoutUser, // 👈 export để nơi khác có thể gọi
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;

StoreContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
