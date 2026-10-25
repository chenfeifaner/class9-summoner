# 会昌中学高二九班抽号器：正式云端部署

正式版采用：

- 前端：GitHub Pages
- 后端：Cloudflare Workers
- 账户与天命账本：Cloudflare D1
- 头像：Cloudflare D1（256px 压缩存储）

数据库中的密码只保存 PBKDF2-SHA256 加盐摘要。抽号、星级计算、天命加分和本轮状态全部在 Worker 中执行，网页无法直接改写排行榜。

## 1. 创建 Cloudflare 资源

在 Cloudflare 控制台创建：

1. D1 数据库：`class9-summoner`

把 D1 数据库 ID 填入 [`backend/wrangler.toml`](backend/wrangler.toml)：

```toml
database_id = "你的 D1 数据库 ID"
```

同时把 `ALLOWED_ORIGINS` 改成正式网页来源，例如：

```toml
ALLOWED_ORIGINS = "https://你的GitHub用户名.github.io"
```

不要包含末尾路径，只填写协议、域名和端口。

## 2. 初始化数据库

在项目根目录执行：

```bash
cd backend
npx wrangler d1 execute class9-summoner --file=./schema.sql --remote
```

Worker 首次运行时会自动补充 56 人名单和班级轮次状态。

已有数据库从旧结构升级时，再执行一次：

```bash
npx wrangler d1 execute class9-summoner --file=./migration-simplify.sql --remote
```

## 3. 部署 Worker

```bash
cd backend
npx wrangler deploy
```

当前正式 API 使用 Cloudflare Pages Functions：

```text
https://class9-summoner-api-pages.pages.dev
```

Worker 地址作为备用入口：

```text
https://class9-summoner-api.chenfeifaner.workers.dev
```

打开以下地址确认服务可用：

```text
https://class9-summoner-api-pages.pages.dev/api/health
```

## 4. 配置 GitHub

1. 把本项目推送到 GitHub 仓库。
2. 在仓库 `Settings > Pages > Build and deployment` 中选择 GitHub Actions。
3. 在 `Settings > Secrets and variables > Actions > Variables` 新增：
   - 名称：`CLASS9_API_BASE_URL`
   - 值：上一步的 Worker 地址，不带末尾 `/`
4. 在 `Settings > Secrets and variables > Actions > Secrets` 新增：
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`

5. 在 `Settings > Secrets and variables > Actions > Variables` 新增：
   - `ENABLE_GITHUB_PAGES=true`
   - `ENABLE_CLOUDFLARE_CI=true`

Cloudflare API Token 至少需要 Worker Scripts 和 D1 的部署权限。不要把 Token 写进仓库或 `config.js`。

工作流：

- `deploy-pages.yml` 构建并发布静态前端。
- `deploy-worker.yml` 应用 D1 表结构并部署备用 Worker。
- `deploy-pages-api.yml` 部署正式 Pages Functions API。

## 5. 本地联调

启动 Worker：

```bash
cd backend
npx wrangler dev
```

临时把根目录 [`config.js`](config.js) 的 `API_BASE_URL` 改成：

```js
window.CLASS9_CONFIG = {
  API_BASE_URL: "http://127.0.0.1:8787"
};
```

然后通过本地静态服务器打开网页。不要把本地地址提交到正式部署。

## 安全说明

- 正式环境必须只允许 HTTPS 来源。
- 不要绕过 Worker 在浏览器中执行抽号或计分。
- 头像限制为 512 KB，格式仅允许 JPG、PNG、WebP。
- 密码长度至少 8 位。
- 建议在 Cloudflare 控制台再开启 WAF 速率限制作为第二层保护。
- 当前会话令牌有效期默认 7 天，可在 `wrangler.toml` 中调整 `SESSION_TTL_HOURS`。
- 页面在前台时每 4 分钟同步一次云端状态，并自动续期已登录会话。
- GitHub Actions 每 6 小时请求一次健康接口和班级状态，用于保活与可用性检查。
