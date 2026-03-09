# Kooboo Local Vue 模板

在 Kooboo 体系下使用 **Vue 3 + Vite** 开发前端的模板项目。前端源码在 `Frontend/`，构建产物输出到 `src/`，通过 [kooboo-cli](https://www.npmjs.com/package/kooboo-cli) 的 `kb sync` 同步到远端 Kooboo。

## 前置条件

需先全局安装 **kooboo-cli**（提供 `kb` 命令）：

```bash
# npm
npm install -g kooboo-cli

# pnpm
pnpm add -g kooboo-cli
```

## 使用

### 安装依赖

```bash
# 根目录
pnpm install

# 前端子项目
cd Frontend && pnpm install && cd ..
```

### 开发

- **同步到远端**：在根目录执行。会监听本地变更并自动同步到 Kooboo。

```bash
pnpm dev
# 或 npm run dev
```

- **仅本地预览前端**：在 `Frontend` 目录下启动 Vite 开发服务器。

```bash
cd Frontend && pnpm dev
```

### 构建

在根目录执行，会构建 `Frontend` 并将产物复制到 `src/page/`、`src/js/`、`src/css/`。

```bash
pnpm build
# 或 npm run build
```

## 项目结构

```
.
├── Frontend/                 # Vue 3 + Vite 前端源码
│   ├── src/
│   │   ├── views/           # 页面
│   │   ├── components/      # 组件
│   │   ├── router/          # Vue Router（需使用 hash 模式）
│   │   ├── stores/          # Pinia
│   │   └── ...
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── src/                     # Kooboo 侧资源（含构建产物）
│   ├── page/                # 构建输出的 HTML
│   ├── js/                  # 构建输出的脚本
│   ├── css/                 # 构建输出的样式
│   ├── api/                 # Kooboo API（可选）
│   └── code/                # Kooboo 后端代码（可选）
├── build.sh                 # 构建脚本（Frontend 构建后复制到 src）
├── package.json
└── tsconfig.json
```

开发时只改 `Frontend/` 下的代码；`src/page/`、`src/js/`、`src/css/` 由构建生成，不要手动修改。
