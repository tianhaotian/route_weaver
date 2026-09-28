# Route Weaver · 阿尔山秋日环线

9 月 29 日下班后从北京出发，10 月 6 日返京。东乌进、柴河出；10 月 2 日上午白狼峰、下午阿尔山国家森林公园。

**旅行网页：https://tianhaotian.github.io/route_weaver/**

## 网页内容

- 八天行程切换，键盘方向键 / Home / End 可选择日期，支持 `#day-4` 等日期直达链接。
- 全程路线示意、每日时间安排、住宿、补电节奏与条件变化时的备选建议。
- 景点和充电站点的高德关键词搜索入口。
- 七晚酒店充电设施核对表：区分店内桩、附近桩、页面仅列设施和未确认情况，附来源、查询日期、住宿补电与备用方案。
- 原方案的票价参考、天气快照、行前确认与装备清单。
- 手机、平板和桌面布局；不依赖外部字体、前端框架或地图 API Key。

数据忠实于提供的行程及后续住宿补充。已选酒店已写入每日安排、住宿总表和高德搜索入口；“已选”不表示网站核验过预订或充电设施。里程不是导航实时结果，票价、天气、路况和充电状态都未实时同步，路线图为非等比例示意图。

10/1 住阿尔山成悦大酒店；10/2 住阿尔山布谷名居度假酒店（阿尔山国家森林公园店），按园内过夜、10/3 游览后转场柴河安排；10/5 住赤峰红山万达广场体育中心亚朵酒店。10/2—10/3 的里程沿用原园内过夜方案，仍需按布谷名居实际位置与车辆入口复核。原清单里的其他酒店只保留为充电线索；返程仍可根据疲劳程度提前在沿途城市住宿。

酒店充电依据于 2026-09-28 查阅的公开预订平台页面，未电话确认或查询实时桩状态。张家口亚朵按页面所示的店内交流桩优先过夜充电；成悦优先核实酒店侧面桩；乌兰浩特全季先核实所列设施的位置。东乌锦颐、柴河星悦按外部站点规划，赤峰亚朵按酒店附近桩规划。布谷名居设施页未列桩，确认前不预计可补入电量。具体证据与来源见网页「已选酒店充电安排」和 [文字手册](./ITINERARY.md#酒店充电核对)。各晚实际可用性、功率、接口、枪数、费用和住客使用规则仍需确认。

## 文件与预览

`docs/` 是完整、无需构建的静态网站。通过 HTTP 访问（ES modules 不支持直接用 `file://` 打开）：

```sh
python3 -m http.server 4173 --directory docs
```

打开 http://localhost:4173。`docs/trip-data.mjs` 维护日期、行程、住宿、补电站和行前确认事项，其中 `hotelCharging` 与 `hotelChargingCheckedAt` 维护酒店充电证据、计划、来源及查询日期；`docs/app.mjs` 渲染交互；`docs/index.html` 和 `docs/styles.css` 维护布局和其余旅行内容。

验证入口、资源、脚本、路线数据和链接格式：

```sh
node scripts/validate.mjs
```

[ITINERARY.md](./ITINERARY.md) 提供不依赖 JavaScript 的文字版每日路线和关键提醒。它与 `trip-data.mjs` 一同维护。

## GitHub Pages

在仓库 Settings → Pages 中选择 GitHub Actions。`.github/workflows/pages.yml` 在推送 `main` 时验证并发布 `docs/`，不需要安装项目依赖。页面所有本地资源使用相对路径，兼容 `/route_weaver/` 项目子目录。

工作流参考 [GitHub 官方 Pages 文档](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)；地图搜索使用 [高德 URI API](https://developer.amap.com/api/uri-api/guide/search/search)。

## 照片许可

照片拍摄于大兴安岭根河湿地附近，作为区域秋色参考，非阿尔山或本路线实拍。摄影 Charlie fong，来自 [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Gegengol_in_Greater_Khingan_forest2017.jpg)，遵循 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)。已缩小至 1400 像素宽，卡片中通过 CSS 裁切；图片及其改编版本继续遵循该许可。详见网站 [图片来源页](./docs/credits.html)。
