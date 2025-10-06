import User from "../models/userModel.js";

export const listUsers = async (req,res) => {
  const { search="", status } = req.query;
  const q = {};
  if (search) q.$or = [
    { name: { $regex: search, $options:"i" } },
    { email:{ $regex: search, $options:"i" } },
  ];
  if (["lock","unlock"].includes(status)) q.status = status;
  const users = await User.find(q).sort({ created_at:-1 }).select("-password");
  res.json({ success:true, data:users });
};

export const updateUserStatus = async (req,res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!["lock","unlock"].includes(status))
    return res.status(400).json({ success:false, message:"Trạng thái không hợp lệ" });
  const user = await User.findByIdAndUpdate(id, { status }, { new:true, runValidators:true }).select("-password");
  if (!user) return res.status(404).json({ success:false, message:"Không tìm thấy user" });
  res.json({ success:true, data:user, message:`Đã ${status==="lock"?"khóa":"mở khóa"} tài khoản` });
};
