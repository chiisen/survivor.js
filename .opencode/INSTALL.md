# 為 OpenCode 安裝 Superpowers 中文版

## 前置條件

- 已安裝 [OpenCode.ai](https://opencode.ai)

## 安裝步驟

在你的 `opencode.json`（全域性或專案級別）中將 superpowers-zh 新增到 `plugin` 陣列：

```json
{
  "plugin": ["superpowers@git+https://github.com/jnMetaCode/superpowers-zh.git"]
}
```

重啟 OpenCode。完成——外掛會自動安裝並註冊所有 skills。

通過詢問來驗證："告訴我你的超能力"

## 從舊版符號連結安裝方式遷移

如果你之前使用 `git clone` 和符號連結安裝過 superpowers，請移除舊的配置：

```bash
# 移除舊的符號連結
rm -f ~/.config/opencode/plugins/superpowers.js
rm -rf ~/.config/opencode/skills/superpowers

# 可選：移除克隆的倉庫
rm -rf ~/.config/opencode/superpowers

# 如果你在 opencode.json 中為 superpowers 新增過 skills.paths，請將其移除
```

然後按照上面的安裝步驟操作。

## 使用方法

使用 OpenCode 的原生 `skill` 工具：

```
use skill tool to list skills
use skill tool to load superpowers/brainstorming
```

## 更新

Superpowers 會在你重啟 OpenCode 時自動更新。

要固定到特定版本：

```json
{
  "plugin": ["superpowers@git+https://github.com/jnMetaCode/superpowers-zh.git#v1.0.0"]
}
```

## 故障排除

### 外掛未載入

1. 檢查日誌：`opencode run --print-logs "hello" 2>&1 | grep -i superpowers`
2. 驗證 `opencode.json` 中的外掛配置
3. 確保你執行的是最新版本的 OpenCode

### Skills 未找到

1. 使用 `skill` 工具列出已發現的內容
2. 檢查外掛是否已載入（見上文）

### 工具對映

當 skills 引用 Claude Code 工具時：
- `TodoWrite` → `todowrite`
- `Task` 子代理 → `@mention` 語法
- `Skill` 工具 → OpenCode 的原生 `skill` 工具
- 檔案操作 → 你的原生工具

## 獲取幫助

- 報告問題：https://github.com/jnMetaCode/superpowers-zh/issues
- 完整文件：https://github.com/jnMetaCode/superpowers-zh
