[中文](./README_CN.md)

# Yet Another [Clash](https://github.com/yaling888/clash) [Dashboard](https://github.com/yaling888/clash-dashboard) [Meta](https://github.com/MetaCubeX/mihomo/tree/Meta) [Classic](https://github.com/MetaCubeX/Yacd-meta/commit/314e68812f7890e84503b1593902e8624e6b6824) Enhance

<p align="center"><img src="https://user-images.githubusercontent.com/78135608/232244383-5e1389db-ce56-4c83-9627-4f3d1a489c6e.png" alt="yacd"></p>

## Usage

Download the [latest build zip file from the gh-pages branch](https://github.com/hmjz100/Yacd-Meta-Classic/archive/gh-pages.zip), unzip it, and serve these static files using a web server (such as Nginx).

Alternatively, you can add the following to your Meta configuration:

```yaml
external-ui: ./ui/
external-ui-url: 'https://github.com/hmjz100/Yacd-Meta-Classic/archive/gh-pages.zip'
```

Restart Meta and check if the `ui` folder in your configuration directory has content. If it does, visit `[External Controller Address]/ui/` to start using it.

### Supported URL Query Parameters

| Parameter | Description                                                                           |
| --------- | ------------------------------------------------------------------------------------- |
| hostname  | Hostname of the Clash backend API (usually the host part of `external-controller`)    |
| port      | Port number of the Clash backend API (usually the port part of `external-controller`) |
| secret    | Clash API secret (the "secret" in `config.yaml`)                                      |
| theme     | UI color scheme (dark, light, auto)                                                   |
| title     | Custom page title (displayed in the browser tab)                                      |

## Development & Deployment

```sh
# Install dependencies
# You can install pnpm via `npm i -g pnpm`
pnpm i

# Start the development server
# Then visit [http://127.0.0.1:3000](http://127.0.0.1:3000)
pnpm dev

# Build optimized resources
# Ready-to-deploy resources will be located in the `public` directory
pnpm build
```

## Credits

This project is forked from [Yacd-meta](https://github.com/MetaCubeX/Yacd-meta/commit/314e68812f7890e84503b1593902e8624e6b6824) and includes subsequent commits.

This project includes the TrueType build of [twemoji](https://github.com/mozilla/twemoji-colr/releases).