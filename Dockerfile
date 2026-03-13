# 基础镜像
FROM node:18-alpine
# 设置工作目录
WORKDIR /app
# 拉取 Gitee 代码（替换为你的 Gitee 仓库地址）
RUN apk add --no-cache git \
    && git clone https://gitee.com/sugarrr57/crystal-ball-server.git . \
    # 若为私有仓库，用 Token 拉取：https://你的用户名:你的GiteeToken@gitee.com/你的用户名/你的仓库名.git
    && npm install
# 暴露端口（根据项目修改，如 3000/8080）
EXPOSE 5000
# 启动项目
CMD ["npm", "start"]
