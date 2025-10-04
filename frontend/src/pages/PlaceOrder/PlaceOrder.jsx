import React, { useContext, useEffect, useState } from 'react'
import './PlaceOrder.css'
import { StoreContext } from '../../Context/StoreContext'
import { assets } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const PlaceOrder = () => {

    const [payment, setPayment] = useState("cod")
    const [data, setData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        street: "",
        city: "",
        state: "",
        zipcode: "",
        country: "",
        phone: ""
    })

    const { getTotalCartAmount, token, food_list, cartItems, url, setCartItems,currency,deliveryCharge } = useContext(StoreContext);

    const navigate = useNavigate();

    const onChangeHandler = (event) => {
        const name = event.target.name
        const value = event.target.value
        setData(data => ({ ...data, [name]: value }))
    }

    const placeOrder = async (e) => {
        e.preventDefault()
        let orderItems = [];
        food_list.map(((item) => {
            if (cartItems[item._id] > 0) {
                let itemInfo = item;
                itemInfo["quantity"] = cartItems[item._id];
                orderItems.push(itemInfo)
            }
        }))
        let orderData = {
            address: data,
            items: orderItems,
            amount: getTotalCartAmount() + deliveryCharge,
        }
        if (payment === "stripe") {
            let response = await axios.post(url + "/api/order/place", orderData, { headers: { token } });
            if (response.data.success) {
                const { session_url } = response.data;
                window.location.replace(session_url);
            }
            else {
                toast.error("Something Went Wrong")
            }
        }
        else{
            let response = await axios.post(url + "/api/order/placecod", orderData, { headers: { token } });
            if (response.data.success) {
                navigate("/myorders")
                toast.success(response.data.message)
                setCartItems({});
            }
            else {
                toast.error("Something Went Wrong")
            }
        }

    }

    useEffect(() => {
        if (!token) {
            toast.error("to place an order sign in first")
            navigate('/cart')
        }
        else if (getTotalCartAmount() === 0) {
            navigate('/cart')
        }
    }, [token])

    return (
        <form onSubmit={placeOrder} className='place-order'>
            <div className="place-order-left">
                <p className='title'>Thông tin giao hàng</p>
                <div className="multi-field">
                     <input type="text" name='firstName' onChange={onChangeHandler} value={data.firstName} placeholder='Tên' required />
        <input type="text" name='lastName' onChange={onChangeHandler} value={data.lastName} placeholder='Họ' required />
    </div>
    
    <input type="email" name='email' onChange={onChangeHandler} value={data.email} placeholder='Địa chỉ email' required />
    <input type="text" name='street' onChange={onChangeHandler} value={data.street} placeholder='Địa chỉ (Số nhà, tên đường, phường/xã)' required />
    
    <div className="multi-field">
        <input type="text" name='city' onChange={onChangeHandler} value={data.city} placeholder='Thành phố / Tỉnh' required />
        <input type="text" name='state' onChange={onChangeHandler} value={data.state} placeholder='Quận / Huyện' required />
    </div>
    
    <div className="multi-field">
        <input type="text" name='country' onChange={onChangeHandler} value={data.country} placeholder='Quốc gia' required />
        <input type="text" name='zipcode' onChange={onChangeHandler} value={data.zipcode} placeholder='Mã bưu chính (nếu có)' />
    </div>
    
    <input type="text" name='phone' onChange={onChangeHandler} value={data.phone} placeholder='Số điện thoại' required />
            </div>
            <div className="place-order-right">
                <div className="cart-total">
                    <h2>Tổng đơn hàng</h2>
                    <div>
                        <div className="cart-total-details"><p>Tổng phụ</p><p>{getTotalCartAmount()}{currency}</p></div>
                        <hr />
                        <div className="cart-total-details"><p>Phí giao hàng</p><p>{getTotalCartAmount() === 0 ? 0 : deliveryCharge}{currency}</p></div>
                        <hr />
                        <div className="cart-total-details"><b>Tổng tiền</b><b>{getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + deliveryCharge}{currency}</b></div>
                    </div>
                </div>
                <div className="payment">
                    <h2>Payment Method</h2>
                    <div onClick={() => setPayment("cod")} className="payment-option">
                        <img src={payment === "cod" ? assets.checked : assets.un_checked} alt="" />
                        <p>COD ( Thanh toán khi nhận hàng )</p>
                    </div>
                    <div onClick={() => setPayment("stripe")} className="payment-option">
                        <img src={payment === "stripe" ? assets.checked : assets.un_checked} alt="" />
                        <p>Stripe ( Tín dụng / Ghi nợ)</p>
                    </div>
                </div>
                <button className='place-order-submit' type='submit'>{payment==="cod"?"Đặt hàng":"Proceed To Payment"}</button>
            </div>
        </form>
    )
}

export default PlaceOrder
