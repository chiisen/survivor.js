# test-player.html 功能規格

## 用途
測試主角角色的旋轉角度與視覺效果，驗證角度系統是否正確。

## 快速確認角度
執行 `npm run angles` 印出目前角度配置：
```
↑上=180°  ←左=270°  ↓下=0°  →右=90°  預設=0°
```

## 佈局

### 左側：井字預覽格子
```
     [↑上]
[←左] [預設] [→右]
     [↓下]
```
- 5 個 100x100 canvas
- 顯示各方向的靜態角色
- 標籤格式：`方向名 角度°`（如 `↑上 180°`）
- 預設格顯示不按鍵時的角色朝向

### 右側：主測試區
- 400x400 canvas
- 角色可旋轉
- 下方顯示：`方向: ↑上`

## 操作方式
- 只 hook 方向鍵和空白鍵，其他按鍵不受影響
- 方向鍵：旋轉角色
- 空白鍵：觸發攻擊動畫
- 放開按鍵：角色回到預設角度

## 角度系統
- 設定檔：`config/angles.json`
- 載入工具：`js/configLoader.js` 的 `loadConfig()` 和 `buildDirToAngle()`
- 角色繪製：`js/playerRenderer.js`
- 旋轉公式：`ctx.rotate(-facingAngle)`
- 角度查表：`js/playerCore.js` 的 `DIR_TO_ANGLE` Map

### 修改角度的注意事項
1. 只改 `config/angles.json` 的角度值
2. **不要改旋轉公式**（`ctx.rotate(-facingAngle)` 是固定的）
3. 改完執行 `npm run angles` 確認
4. 執行 `npm test` 確認測試通過

## 檔案結構
```
test-player.html        # 測試頁面
js/playerRenderer.js    # 角色繪製
js/playerCore.js        # 角度查表 (DIR_TO_ANGLE)
js/configLoader.js      # JSON 載入工具
config/angles.json      # 角度設定
package.json            # npm run angles 指令
```

## 新增功能的溝通格式

當要新增功能時，請說明：
1. **位置**：左側格子 / 右側主區 / 兩者都要
2. **互動方式**：靜態顯示 / 按鍵控制 / 滑鼠操作
3. **視覺效果**：什麼會改變（角度、顏色、動畫等）
4. **數據來源**：從 JSON 讀取 / 硬編碼 / 動態計算

## 範例

**使用者說**：「加一個血條在預設格子下面」
**我理解**：在井字格子的第 5 格（預設）下方新增一個 canvas，繪製血條，靜態顯示。

**使用者說**：「按空白鍵顯示傷害數字」
**我理解**：在右側主區，按空白鍵時在角色位置顯示傷害數字動畫。

**使用者說**：「改上為0度」
**我理解**：只改 `config/angles.json` 的 `up.angle` 為 0，不改旋轉公式。
