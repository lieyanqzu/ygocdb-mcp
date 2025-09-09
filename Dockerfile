FROM node:22-slim

# 设置工作目录
WORKDIR /app

# 复制所有必要文件
COPY package*.json ./
COPY tsconfig.json ./
COPY index.ts ./

# 安装所有依赖
RUN npm ci

# 构建TypeScript代码（如果prepare脚本没有执行）
RUN npm run build

# 清理dev依赖以减小镜像大小
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# 设置传输模式为HTTP
ENV TRANSPORT=http

# 直接用node启动服务器
CMD ["node", "dist/index.js"] 