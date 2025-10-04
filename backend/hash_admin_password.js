// file: hash_admin_password.js

import bcrypt from 'bcrypt';

// Đây là một hàm async để thực hiện việc mã hóa
async function hashAdminPassword() {
    // Mật khẩu bạn muốn đặt cho admin
    const plainPassword = 'AdminPassword@2024'; 
    
    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    // In kết quả ra màn hình terminal
    console.log("Mật khẩu đã mã hóa (để lưu vào DB):");
    console.log(hashedPassword);
}

// *** DÒNG QUAN TRỌNG NHẤT: Gọi hàm để nó thực sự chạy ***
hashAdminPassword();