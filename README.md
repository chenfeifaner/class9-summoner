# 会昌中学高二九班专用抽号器

正式访问地址：[https://chenfeifaner.github.io/class9-summoner/](https://chenfeifaner.github.io/class9-summoner/)

## 技术架构

- 前端：GitHub Pages
- API：Cloudflare Workers
- API 公网入口：Cloudflare Pages Functions
- 数据库：Cloudflare D1
- 账户认证：PBKDF2-SHA256 加盐密码摘要与服务端会话
- 抽号与天命计分：服务端执行

## 功能

- 56 位同学实名账户与生日星契
- 免登录班级抽号
- 按被抽中同学的生日和纳音计算星级
- 三星、四星、五星抽取动画
- 天命值排行榜
- 个人头像与生日更新
- 全班星图与抽取记录

云端部署和维护说明见 [README-CLOUD.md](README-CLOUD.md)。

正式 API 地址：`https://class9-summoner-api-pages.pages.dev`
