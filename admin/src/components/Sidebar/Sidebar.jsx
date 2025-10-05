/* eslint-disable no-unused-vars */
import React from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-options">

        {/* Thêm cây mới */}
        <NavLink 
          to="/add" 
          className={({ isActive }) => 
            isActive ? "sidebar-option active" : "sidebar-option"
          }
        >
          <p>Thêm cây mới</p>
        </NavLink>

        {/* Danh sách cây */}
        <NavLink 
          to="/list" 
          className={({ isActive }) => 
            isActive ? "sidebar-option active" : "sidebar-option"
          }
        >
          <p>Danh sách cây</p>
        </NavLink>

        {/* Đơn đặt hàng */}
        <NavLink 
          to="/orders" 
          className={({ isActive }) => 
            isActive ? "sidebar-option active" : "sidebar-option"
          }
        >
          <p>Đơn đặt hàng</p>
        </NavLink>

        {/* Quản lý kho hàng */}
        <NavLink 
          to="/stock" 
          className={({ isActive }) => 
            isActive ? "sidebar-option active" : "sidebar-option"
          }
        >
          <p>Quản lí kho hàng</p>
        </NavLink>

        {/* <NavLink to="/users" className={({isActive}) => isActive ? "sidebar-option active" : "sidebar-option"}>
  <p>👥 Users</p>
</NavLink> */}

        
      </div>
    </div>
  );
};

export default Sidebar;