import React from 'react'
import './Footer.css'
import { assets } from '../../assets/assets'

const Footer = () => {
  return (
    <div className='footer' id='footer'>
      <div className="footer-content">
        <div className="footer-content-left">
            <img src={assets.logo} alt="" />
            <p>Mỗi đóa hoa không chỉ là một món quà, mà là lời thì thầm của yêu thương, là sự quan tâm dịu dàng được gửi trao qua từng cánh mỏng. Hãy để chúng tôi giúp bạn kể câu chuyện của riêng mình, một câu chuyện được dệt nên từ hương sắc và những xúc cảm chân thành nhất.</p>
            <div className="footer-social-icons">
                <img src={assets.facebook_icon} alt="" />
                <img src={assets.twitter_icon} alt="" />
                <img src={assets.linkedin_icon} alt="" />
            </div>
        </div>
        <div className="footer-content-center">
            <h2>CÔNGTY</h2>
            <ul>
                <li>NOW</li>
                <li>Trang chủ</li>
                <li>Danh mục</li>
                <li>Liên hệ với chúng tôi</li>
            </ul>
        </div>
        <div className="footer-content-right">
            <h2>LIÊN HỆ</h2>
            <ul>
                <li>0365986732</li>
                <li>tdat07082004@gmail.com</li>
            </ul>
        </div>
      </div>
      <hr />
      <p className="footer-copyright">https://www.facebook.com/nguyen.aat.2024</p>
    </div>
  )
}

export default Footer
