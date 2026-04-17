# Yet Another [Clash](https://github.com/yaling888/clash) [Dashboard](https://github.com/yaling888/clash-dashboard) [Meta](https://github.com/MetaCubeX/mihomo/tree/Meta) [Classic](https://github.com/MetaCubeX/Yacd-meta/commit/314e68812f7890e84503b1593902e8624e6b6824) Enchance

<p align="center"><img src="https://user-images.githubusercontent.com/78135608/232244383-5e1389db-ce56-4c83-9627-4f3d1a489c6e.png" alt="yacd"></p>

## 用法

下载 [存放在 gh-pages 分支的最新构建 zip 文件](https://github.com/hmjz100/Yacd-Meta-Classic/archive/gh-pages.zip)，解压缩并使用 Web 服务器（如 Nginx）提供这些静态文件。

或者，也可以在 Meta 的配置文件中增加：

```yaml
external-ui: ./ui/
external-ui-url: 'https://github.com/hmjz100/Yacd-Meta-Classic/archive/gh-pages.zip'
```

重启 Meta，检查配置目录的 `ui` 文件夹是否有内容；如有，访问 `[外部控制的监听地址]/ui/` 即可享用。

### 支持的 URL 查询参数

| 参数     | 描述                                                                 |
| -------- | -------------------------------------------------------------------- |
| hostname | Clash 后端 API 的主机名（通常是 `external-controller` 的 host 部分） |
| port     | Clash 后端 API 的端口号（通常是 `external-controller` 的 port 部分） |
| secret   | Clash API 密钥（`config.yaml` 中的"secret"）                         |
| theme    | UI 颜色方案（dark、light、auto）                                     |
| title    | 自定义页面标题（显示于浏览器标签）                                   |

## 开发部署

```sh
# 安装依赖库
# 你可以使用 `npm i -g pnpm` 安装 pnpm
pnpm i
# 启动开发服务器
# 然后访问 http://127.0.0.1:3000
pnpm dev
# 构建优化资源
# 准备好部署的资源将在目录 `public` 中
pnpm build
```

## 致谢

本项目 Fork 自 [Yacd-meta](https://github.com/MetaCubeX/Yacd-meta/commit/314e68812f7890e84503b1593902e8624e6b6824)，并包含了后续的部分 Commit。

本项目包含了 [twemoji](https://github.com/mozilla/twemoji-colr/releases) 的 TrueType 构建。