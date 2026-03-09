const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function checkUsers() {
    try {
        console.log('正在连接数据库...\n');

        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('✅ 数据库连接成功！\n');

        const User = mongoose.model('User', new mongoose.Schema({
            username: String,
            email: String,
            password: String,
            createdAt: Date,
            lastLoginAt: Date,
        }));

        // 查找所有用户
        const users = await User.find({});
        console.log(`📊 数据库中共有 ${users.length} 个用户:\n`);

        if (users.length === 0) {
            console.log('⚠️  数据库中没有任何用户！\n');
            console.log('建议：使用注册接口创建一个新用户\n');
        } else {
            users.forEach((user, index) => {
                console.log(`${index + 1}. 用户名：${user.username}`);
                console.log(`   邮箱：${user.email || '无'}`);
                console.log(`   密码哈希：${user.password ? user.password.substring(0, 30) + '...' : '无'}`);
                console.log(`   创建时间：${user.createdAt}`);
                console.log(`   最后登录：${user.lastLoginAt || '从未'}\n`);
            });

            // 检查 Admin 用户
            const adminUser = await User.findOne({ username: 'Admin' });
            if (adminUser) {
                console.log('🔍 测试 Admin 用户登录...');
                const testPassword = 'admin123';
                const isMatch = await bcrypt.compare(testPassword, adminUser.password);

                console.log(`\n测试结果:`);
                console.log(`- 输入密码：${testPassword}`);
                console.log(`- 验证结果：${isMatch ? '✅ 密码正确' : '❌ 密码错误'}`);

                if (!isMatch) {
                    console.log('\n⚠️  问题：数据库中 Admin 用户的密码不是 "admin123" 的哈希值');
                    console.log('解决方案：');
                    console.log('1. 删除这个 Admin 用户，重新通过注册接口创建');
                    console.log('2. 或者运行 temp-fix-admin.js 脚本修复密码\n');
                }
            } else {
                console.log('⚠️  没有找到 Admin 用户');
                console.log('建议：通过注册接口创建一个新用户\n');
            }
        }

        await mongoose.disconnect();
        console.log('已断开连接');

    } catch (error) {
        console.error('❌ 错误:', error.message);
        console.error('\n请检查 .env 文件中的数据库连接配置');
    }
}

checkUsers();
