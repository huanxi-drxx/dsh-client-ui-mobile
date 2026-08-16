# dsh-client-ui-mobile

让 [DSH](https://github.com/deepseek-ai/deepseek-harness) 的 Web 界面在**手机浏览器**上以抽屉式侧栏布局适配显示。电脑端打开与原版**完全一致**，只有手机浏览器（按 UA 识别）才会发生变化。

> 测试环境：DSH `0.1.0-rc.6`（web profile）。核心功能基于布局框架的稳定 data 属性，跨版本可用；部分细节样式依赖特定版本类名，详见[兼容性](#-兼容性说明)。

---

## ✨ 功能

| 功能 | 说明 |
|---|---|
| 📱 抽屉式布局 | 手机端侧栏隐藏，对话区占满全屏；☰ 按钮滑出侧栏抽屉，点遮罩关闭 |
| 🖥 桌面端不变 | ≥1024px 且非移动设备时，界面与原版完全一致 |
| 📊 统计栏 | 底部对话统计折叠为"一行预览 + 展开箭头"，点击展开完整统计 |
| ⏱ 消息元信息 | 每条消息下方的"时间 · 用时 · TTFT · tok/s"完整显示，紧凑竖线分隔 |
| ⌨️ 回车设置 | 设置 → 通用 → **手机端回车键**：回车 = 发送消息，或回车 = 插入换行 |
| 🖼 聊天背景 | 设置 → 通用 → **聊天背景**：选择图片、手动裁剪（拖动 + 缩放）、调节**背景模糊**与**毛玻璃**透明度；切换会话自动保留 |
| 💬 AI 气泡与头像 | 设置 → 通用 → **AI 聊天气泡**（浅金色开关）；**用户头像 / AI 头像**独立开关、自定义上传（圆形裁剪）、默认头像 |
| 💰 余额显示 | 模型选择器中显示供应商余额（DeepSeek `¥` / OpenRouter `$` / OpenAI `$`）；无余额 API 的厂商自动隐藏 |
| 📎 文件上传 | 输入 `/` → "上传文件"，或手机端点输入栏左下角 **＋** 按钮 → **上传文件**：选择手机上的文件 → 上传到当前工作目录，路径追加到输入框（可补充说明后发送，不自动发送） |
| ➕ 加号动作栏 | 手机端输入栏左下角 **＋** 按钮弹出选择栏：**命令**（原生命令菜单）/ **上传文件**；桌面端保持原样 |
| 🔍 网页搜索 | 设置 → 插件 → 插件配置 → **网页搜索**：配置多个搜索服务（**Exa / Brave / Bing / Tavily / Firecrawl / DeepSeek**），各填 API Key；模型选择器中点 **搜索模型** 入口切换当前搜索服务 |
| 🌐 中英双语 | 全部插件界面文字接入应用语言系统，切换语言即时生效 |
| ⚙️ 设置页适配 | 手机端设置面板全屏显示、导航横向排列，插件列表完整显示 |
| 🛠 工具管理 | 设置 → **工具**：搜索栏按名称/描述实时过滤；每个工具右侧开关可**启用/禁用**，被禁用的工具对模型不可见、不可调用；清单存于 `~/.dsh/dshm-tools-config.json`，重启后依然生效 |

完整变更记录见 [CHANGELOG.md](./CHANGELOG.md)。

## 📦 安装

要求：已安装 DSH（web profile），即 `~/.dsh/profiles/web/` 目录存在。

### 自动安装（推荐）

```bash
git clone <你的仓库地址> dsh-client-ui-mobile
cd dsh-client-ui-mobile
./install.sh
```

安装脚本会：
1. 把插件复制到 `~/.dsh/profiles/web/node_modules/@local/dsh-client-ui-mobile/`
2. 在 `~/.dsh/profiles/web/cordis.patch.yml` 中添加 `ui-mobile` 组合行，并把 `web` 行的 `searchProvider` 切到 `dshm-search`（网页搜索功能依赖此行）

然后**重启 DSH**（宿主半提供余额/上传路由，必须重启才加载），并在浏览器中**强制刷新**（Ctrl/Cmd+Shift+R）即可生效。

### 手动安装

```bash
# 1. 复制插件包
mkdir -p ~/.dsh/profiles/web/node_modules/@local
cp -r lib package.json ~/.dsh/profiles/web/node_modules/@local/dsh-client-ui-mobile/

# 2. 在 ~/.dsh/profiles/web/cordis.patch.yml 末尾添加：
# - id: web
#   config:
#     searchProvider: dshm-search
#
# - insert:
#     - id: ui-mobile
#       name: '@local/dsh-client-ui-mobile'

# 3. 重启 dsh，浏览器强制刷新
```

## 🗑 卸载

```bash
./uninstall.sh
```

或手动：删除 `~/.dsh/profiles/web/node_modules/@local/dsh-client-ui-mobile/`，并移除 `cordis.patch.yml` 中的 `ui-mobile` 行，然后重启 dsh。

## 🎯 使用

- 手机浏览器打开 DSH 网页 → 自动启用移动布局（无需配置）
- ☰ 按钮（左上角/会话头部）→ 滑出侧栏抽屉；点击遮罩 → 关闭
- 底部统计 → 点展开箭头看完整数据，再点收起
- 模型选择器 → 供应商标题右侧显示余额（DeepSeek/OpenRouter/OpenAI；其余厂商不显示）
- 输入 `/` → "上传文件"，或手机端点输入栏左下角 **＋** → **上传文件** → 选文件上传 → 路径追加到输入框（不会自动发送）
- 设置 → 插件 → 插件配置 → **网页搜索** → 添加搜索服务（名称 + 类型 + API Key）→ 模型选择器点 **搜索模型** 切换
- 设置 → 通用 → **手机端回车键** → 选择"发送消息"或"插入换行"（默认发送，偏好保存在浏览器本地）

## 🔍 检测逻辑（什么设备会启用移动布局）

**只看浏览器标识（UA）**：

```
/Android|iPhone|iPod|iPad|Windows Phone|Mobile/i.test(navigator.userAgent)
```

- 手机浏览器（UA 含移动标识）→ 启用移动布局
- 开了"桌面版网站"且浏览器真的切换了 UA → 视为电脑，显示桌面布局
- 桌面浏览器 → 保持原版布局

## ⚠️ 兼容性说明

- **核心抽屉布局**：基于 DSH 布局框架的稳定 data 属性（`data-sidebar-collapsed`、`data-details-collapsed`、`data-shell-overlay`），DSH 升级后通常仍可用。
- **细节样式**：设置页全屏、统计栏、消息元信息分隔、头部按钮位置等依赖该版本生成的 CSS 类名（如 `wSkVaW_*`、`VOzbGW_*`、`p-xYUq_*`、`FJxK0a_*`、`qSYn7G_*`）。DSH 升级后若某处样式失效，更新 `lib/client.js` 中对应的类名即可（本仓库欢迎 PR）。
- 这是社区插件，非 DSH 官方组件；使用前建议备份 `cordis.patch.yml`。

## 📄 License

[MIT](./LICENSE)
