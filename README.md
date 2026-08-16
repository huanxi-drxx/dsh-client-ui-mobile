# dsh-client-ui-mobile

让 [DSH](https://github.com/deepseek-ai/deepseek-harness) 的 Web 界面适配手机浏览器，同时加入消息编辑与多模型网页搜索等实用功能。桌面端保持原样，只有手机浏览器（按 UA 识别）才会启用移动布局。

测试环境：DSH `0.1.0-rc.6`（web profile）。核心布局基于框架的稳定 data 属性，跨版本可用；部分细节样式依赖特定版本类名，见文末兼容性说明。

---

## 功能

| 功能 | 说明 |
|---|---|
| 抽屉式布局 | 手机端侧栏收起，对话区占满全屏；点左上角按钮滑出侧栏，点遮罩关闭 |
| 桌面端不变 | 桌面浏览器 UA 下界面与原版一致 |
| 消息编辑 | 每条 AI 与用户消息下方有编辑、删除、重新生成三个按钮。编辑只改文本，不会触发 AI 重新生成；删除只删目标消息（删除 AI 消息会连同该回合内的工具调用记录一并移除）；重新生成从被点击的那条用户消息开始 |
| 多模型网页搜索 | 在设置 - 插件 - 网页搜索中配置搜索服务，支持 Exa、Brave、Bing、Tavily、Firecrawl、DeepSeek、You.com、Serper、SerpApi、Kagi、SearXNG（自托管）、Bocha（博查）共 12 种，各填各的 API Key；模型选择器里的"搜索模型"入口切换当前服务 |
| 工具管理 | 设置 - 工具：按名称或描述过滤，每个工具可单独启用或禁用，配置存于 `~/.dsh/dshm-tools-config.json`，重启后生效 |
| 文件上传 | 输入 `/` 或点输入栏左侧加号，选择手机文件上传到当前工作目录，路径追加到输入框（不自动发送） |
| 余额显示 | 模型选择器中显示供应商余额（DeepSeek / OpenRouter / OpenAI），无余额接口的厂商自动隐藏 |
| 聊天背景与头像 | 设置 - 通用：聊天背景图（裁剪、模糊、毛玻璃）、AI 气泡颜色、用户与 AI 头像（上传 + 圆形裁剪） |
| 回车设置 | 设置 - 通用 - 手机端回车键：回车发送或回车换行 |
| 统计栏 | 底部统计折叠为一行预览，点击展开；消息下方的时间、用时、TTFT、tok/s 完整显示 |
| 中英双语 | 插件界面文字跟随应用语言 |

更新记录见 [CHANGELOG.md](./CHANGELOG.md)。

## 安装

要求：已安装 DSH（web profile），即 `~/.dsh/profiles/web/` 目录存在。

```bash
git clone <仓库地址> dsh-client-ui-mobile
cd dsh-client-ui-mobile
./install.sh
```

脚本会把插件复制到 `~/.dsh/profiles/web/node_modules/@local/dsh-client-ui-mobile/`，并在 `~/.dsh/profiles/web/cordis.patch.yml` 中添加组合行、把 `web` 行的 `searchProvider` 切到 `dshm-search`。

装完后重启 DSH，浏览器强制刷新即可。

手动安装：

```bash
mkdir -p ~/.dsh/profiles/web/node_modules/@local
cp -r lib package.json ~/.dsh/profiles/web/node_modules/@local/dsh-client-ui-mobile/
```

然后在 `~/.dsh/profiles/web/cordis.patch.yml` 末尾追加：

```yaml
- id: web
  config:
    searchProvider: dshm-search

- insert:
    - id: ui-mobile
      name: '@local/dsh-client-ui-mobile'
```

重启 DSH，刷新浏览器。

## 卸载

```bash
./uninstall.sh
```

或手动删除 `~/.dsh/profiles/web/node_modules/@local/dsh-client-ui-mobile/`，移除 `cordis.patch.yml` 中的 `ui-mobile` 行，重启 DSH。

## 使用

- 手机浏览器打开 DSH 网页即自动启用移动布局
- 消息下方按钮：编辑（改文本）、删除、重新生成（仅用户消息，从该条开始重新生成）
- 设置 - 插件 - 插件配置 - 网页搜索：添加搜索服务（类型 + API Key），SearXNG 需要填自托管地址、不需要 Key；模型选择器中点"搜索模型"切换
- 设置 - 工具：开关各工具
- 输入 `/` 或点加号上传文件

## 移动布局的检测逻辑

只看 UA：

```
/Android|iPhone|iPod|iPad|Windows Phone|Mobile/i.test(navigator.userAgent)
```

- 手机浏览器（UA 含移动标识）启用移动布局
- 浏览器切换为桌面 UA 后视为电脑，显示桌面布局

## 兼容性说明

- 核心抽屉布局基于稳定 data 属性（`data-sidebar-collapsed`、`data-details-collapsed`、`data-shell-overlay`），DSH 升级后通常仍可用
- 细节样式（设置页、统计栏、消息元信息等）依赖当前版本生成的 CSS 类名，DSH 升级后若失效，更新 `lib/client.js` 中对应类名即可
- 本插件为社区作品，非 DSH 官方组件；改配置前建议备份 `cordis.patch.yml`

## License

[MIT](./LICENSE)
