import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import userModel from "../models/userModel.js";
// import registerUser from "./userController.js";
// import loginUser from "./userController.js";

//create token
const createToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET);
}

//login user
 const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1️⃣ Kiểm tra tồn tại
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "Email không tồn tại" });
    }

    // 2️⃣ Kiểm tra bị khóa chưa
    if (user.status === "lock") {
      return res.status(403).json({
        success: false,
        message: "Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.",
      });
    }

    // 3️⃣ So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Sai mật khẩu" });
    }

    // 4️⃣ Tạo JWT token
    const token = createToken(user._id);

    // 5️⃣ Trả về cho FE
    res.json({
      success: true,
      token,
      message: "Đăng nhập thành công",
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};

//register user
const registerUser = async (req,res) => {
    const {name, email, password} = req.body;
    try{
        //check if user already exists
        const exists = await userModel.findOne({email})
        if(exists){
            return res.json({success:false,message: "User already exists"})
        }

        // validating email format & strong password
        if(!validator.isEmail(email)){
            return res.json({success:false,message: "Please enter a valid email"})
        }
        if(password.length<8){
            return res.json({success:false,message: "Please enter a strong password"})
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10); // the more no. round the more time it will take
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new userModel({name, email, password: hashedPassword})
        const user = await newUser.save()
        const token = createToken(user._id)
        res.json({success:true,token})

    } catch(error){
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

export {loginUser, registerUser}