/* eslint-disable no-unused-vars */
import React from 'react'
import  './Sidebar.css'
import { assets } from '../../assets/assets'
import { NavLink } from 'react-router-dom'

const Sidebar = () => {
  return (
    <div className='sidebar'>
      <div className="sidebar-options">
        <NavLink to='/add' className="sidebar-option">
            <img src={assets.add_icon} alt="" />
            <p>Thêm cây mới</p>
        </NavLink>
        <NavLink to='/list' className="sidebar-option">
            <img src={assets.order_icon} alt="" />
            <p>Danh sách cây</p>
        </NavLink>
          <NavLink to='/orders' className="sidebar-option">
              <img src={assets.order_icon} alt="" />
              <p>Đơn đặt hàng</p>
          </NavLink>
        <NavLink to='/createWarehouse' className="sidebar-option">
        
          <p>Tạo Kho hàng</p>
        </NavLink>
        <NavLink to='/listWarehouses' className="sidebar-option">
              <img src={assets.warehouse_icon} alt="" />
              <p>Kho hàng</p>
          </NavLink>
          
      </div>
    </div>
  )
}

export default Sidebar
