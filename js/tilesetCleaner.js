// @ts-check

export class TilesetCleaner {
    /**
     * 素材圖集清理器
     * @returns {void}
     */
    constructor() {
        this.cleanTileset = null;
        this.tileSize = 32;
        this.padding = 0;
        this.layoutMode = 'optimal';
        this.customCols = null;
        this.customRows = null;
        this.usePadding = false;
        this.preserveOriginalSize = true;  // 新增：保留原始尺寸
    }
    
    /**
     * 設定是否保留原始尺寸
     * @param {boolean} preserve - 是否保留原始尺寸
     * @returns {void}
     */
    setPreserveOriginalSize(preserve) {
        this.preserveOriginalSize = preserve;
    }
    
    /**
     * 設定佈局模式
     * @param {string} mode - 佈局模式 ('square'|'optimal'|'horizontal'|'vertical'|'custom')
     * @param {number|null} [cols=null] - 自定義列數
     * @param {number|null} [rows=null] - 自定義行數
     * @returns {void}
     */
    setLayoutMode(mode, cols = null, rows = null) {
        this.layoutMode = mode;
        this.customCols = cols;
        this.customRows = rows;
    }
    
    /**
     * 計算圖集佈局
     * @param {number} totalTiles - 總素材數量
     * @returns {{cols: number, rows: number, isSquare: boolean}} 佈局資訊
     */
    calculateLayout(totalTiles) {
        switch (this.layoutMode) {
            case 'square':
                const size = Math.ceil(Math.sqrt(totalTiles));
                return { cols: size, rows: size, isSquare: true };
            
            case 'optimal':
                const cols = Math.ceil(Math.sqrt(totalTiles));
                const rows = Math.ceil(totalTiles / cols);
                return { cols, rows, isSquare: cols === rows };
            
            case 'horizontal':
                return { cols: totalTiles, rows: 1, isSquare: false };
            
            case 'vertical':
                return { cols: 1, rows: totalTiles, isSquare: false };
            
            case 'custom':
                return {
                    cols: this.customCols || Math.ceil(Math.sqrt(totalTiles)),
                    rows: this.customRows || Math.ceil(totalTiles / this.customCols),
                    isSquare: false
                };
            
            default:
                return this.calculateLayout(totalTiles);
        }
    }
    
    /**
     * 清理並產生乾淨圖集
     * @param {string} sourceImage - 來源圖片路徑
     * @param {Array} tilePositions - 素材位置陣列
     * @returns {Promise<string>} 產生的圖片 Data URL
     */
    async cleanAndGenerate(sourceImage, tilePositions) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const totalTiles = tilePositions.length;
                
                const layout = this.calculateLayout(totalTiles);
                const { cols, rows } = layout;
                
                let cellSize = this.tileSize + this.padding;
                
                if (this.preserveOriginalSize) {
                    let maxWidth = 0;
                    let maxHeight = 0;
                    tilePositions.forEach(tile => {
                        maxWidth = Math.max(maxWidth, tile.width);
                        maxHeight = Math.max(maxHeight, tile.height);
                    });
                    cellSize = Math.max(maxWidth, maxHeight) + this.padding;
                }
                
                canvas.width = cols * cellSize;
                canvas.height = rows * cellSize;
                
                const ctx = canvas.getContext('2d');
                
                ctx.fillStyle = '#1a1a2e';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                tilePositions.forEach((pos, index) => {
                    const targetX = (index % cols) * cellSize;
                    const targetY = Math.floor(index / cols) * cellSize;
                    
                    if (this.preserveOriginalSize) {
                        ctx.drawImage(
                            img,
                            pos.x, pos.y, pos.width, pos.height,
                            targetX, targetY, pos.width, pos.height
                        );
                        
                        if (this.usePadding) {
                            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                            ctx.lineWidth = 1;
                            ctx.strokeRect(targetX, targetY, pos.width, pos.height);
                        }
                    } else {
                        ctx.drawImage(
                            img,
                            pos.x, pos.y, pos.width, pos.height,
                            targetX, targetY, this.tileSize, this.tileSize
                        );
                        
                        if (this.usePadding) {
                            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                            ctx.lineWidth = 1;
                            ctx.strokeRect(targetX, targetY, this.tileSize, this.tileSize);
                            
                            ctx.fillStyle = 'rgba(241, 196, 15, 0.8)';
                            ctx.font = '10px Arial';
                            ctx.textAlign = 'center';
                            ctx.fillText(`#${index + 1}`, targetX + this.tileSize / 2, targetY + this.tileSize - 5);
                        }
                    }
                });
                
                this.cleanTileset = canvas;
                this.layoutInfo = layout;
                this.generatedCellSize = cellSize;
                resolve(canvas.toDataURL('image/png'));
            };
            img.src = sourceImage;
        });
    }
    
    /**
     * 下載乾淨圖集
     * @param {string} dataUrl - 圖片 Data URL
     * @param {string} [filename='clean_tileset.png'] - 下載檔案名稱
     * @returns {void}
     */
    downloadCleanTileset(dataUrl, filename = 'clean_tileset.png') {
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        link.click();
    }
    
    /**
     * 建立素材位置編輯器
     * @param {string} containerId - 容器元素 ID
     * @param {string} sourceImage - 來源圖片路徑
     * @returns {void}
     */
    createTilePositionEditor(containerId, sourceImage) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = `
            <div style="background: rgba(0,0,0,0.8); padding: 20px; border-radius: 10px;">
                <h3 style="color: #3498db; margin-bottom: 15px;">🛠️ 素材位置编辑器</h3>
                
                <div style="margin-bottom: 20px; padding: 10px; background: rgba(52, 152, 219, 0.2); border-radius: 8px; border-left: 4px solid #3498db;">
                    <label style="color: #ecf0f1; font-weight: bold; margin-right: 10px;">素材尺寸：</label>
                    <input type="number" id="tile-size-input" value="${this.tileSize}" min="16" max="128" step="16" style="padding: 5px; width: 80px; background: #34495e; color: #ecf0f1; border: 1px solid #3498db; border-radius: 5px;">
                    <span style="color: #95a5a6; font-size: 14px;">px（預設 32px，可調整為 16/32/64/128）</span>
                    
                    <label style="color: #ecf0f1; font-weight: bold; margin-left: 20px; margin-right: 10px;">格子間距：</label>
                    <input type="checkbox" id="use-padding-checkbox" ${this.usePadding ? 'checked' : ''} style="width: 20px; height: 20px;">
                    <span style="color: #95a5a6; font-size: 14px;">啟用 2px 間距（關閉可生成完美正方形）</span>
                    
                    <div style="margin-top: 10px;">
                        <label style="color: #ecf0f1; font-weight: bold; margin-right: 10px;">尺寸處理：</label>
                        <select id="size-mode" style="padding: 5px; background: #34495e; color: #ecf0f1; border: 1px solid #3498db; border-radius: 5px;">
                            <option value="preserve" ${this.preserveOriginalSize ? 'selected' : ''}>🔒 保留原始尺寸（推薦）</option>
                            <option value="scale" ${!this.preserveOriginalSize ? 'selected' : ''}>📐 縮放為統一尺寸（${this.tileSize}x${this.tileSize}）</option>
                        </select>
                        <span style="color: #95a5a6; font-size: 14px;">
                            ${this.preserveOriginalSize 
                                ? '保留原始尺寸（72x72、64x96 等），每格大小自動調整' 
                                : '強制縮放為統一尺寸（可能變形或模糊）'}
                        </span>
                    </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="color: #ecf0f1; font-weight: bold; margin-right: 10px;">圖集布局模式：</label>
                    <select id="layout-mode" style="padding: 8px; background: #34495e; color: #ecf0f1; border: 1px solid #3498db; border-radius: 5px;">
                        <option value="optimal">🎯 最優布局（推薦）</option>
                        <option value="square">⬜ 強制正方形</option>
                        <option value="horizontal">━ 水平排列</option>
                        <option value="vertical">┃ 垂直排列</option>
                        <option value="custom">⚙️ 自定義尺寸</option>
                    </select>
                    
                    <div id="custom-size-inputs" style="display: none; margin-top: 10px;">
                        <input type="number" id="custom-cols" placeholder="列數" min="1" style="padding: 8px; width: 80px; background: #34495e; color: #ecf0f1; border: 1px solid #3498db; border-radius: 5px;">
                        <input type="number" id="custom-rows" placeholder="行數" min="1" style="padding: 8px; width: 80px; margin-left: 10px; background: #34495e; color: #ecf0f1; border: 1px solid #3498db; border-radius: 5px;">
                        <button id="apply-custom-btn" style="padding: 8px 15px; margin-left: 10px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">應用</button>
                    </div>
                </div>
                
                <div style="margin-bottom: 15px; padding: 10px; background: rgba(46, 204, 113, 0.2); border-radius: 8px; border-left: 4px solid #2ecc71;">
                    <strong style="color: #2ecc71;">💡 正方形尺寸計算：</strong>
                    <span style="color: #ecf0f1;">
                        關閉間距 → <strong style="color: #f1c40f;">${this.tileSize}x${this.tileSize} 素材</strong> → 
                        <strong style="color: #3498db;">完美正方形</strong>（如 3x3 = ${3*this.tileSize}x${3*this.tileSize}px）
                    </span>
                </div>
                
                <div style="margin-bottom: 15px; padding: 10px; background: rgba(52, 152, 219, 0.2); border-radius: 8px; border-left: 4px solid #3498db;">
                    <strong style="color: #f1c40f;">💡 建議：</strong>
                    <span style="color: #ecf0f1;">使用「最優布局」可避免重出問題。如需預留空間給未來素材，請選「自定義尺寸」。</span>
                </div>
                
                <div style="position: relative; display: inline-block;">
                    <img src="${sourceImage}" style="max-width: 800px; border: 2px solid #f1c40f;">
                    <canvas id="overlay-canvas" style="position: absolute; top: 0; left: 0; pointer-events: none;"></canvas>
                </div>
                
                <div style="margin-top: 20px;">
                    <button id="add-tile-btn" style="padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">➕ 新增素材位置</button>
                    <button id="undo-btn" style="padding: 10px 20px; background: #9b59b6; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">↩️ 撤销</button>
                    <button id="delete-btn" style="padding: 10px 20px; background: #e74c3c; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px; display: none;">❌ 删除选中</button>
                    <button id="save-tileset-btn" style="padding: 10px 20px; background: #2ecc71; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">💾 生成乾淨圖集</button>
                    <button id="clear-btn" style="padding: 10px 20px; background: #95a5a6; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">🗑️ 清除全部</button>
                </div>
                
                <div id="preview-result" style="display: none; margin-top: 30px; padding: 20px; background: rgba(46, 204, 113, 0.2); border-radius: 10px; border-left: 4px solid #2ecc71;">
                    <h3 style="color: #2ecc71; margin-bottom: 15px;">✅ 生成的乾淨圖集預覽</h3>
                    <div style="text-align: center; margin-bottom: 20px;">
                        <canvas id="preview-canvas" style="border: 3px solid #f1c40f; max-width: 100%; background: #1a1a2e;"></canvas>
                    </div>
                    <div style="margin-bottom: 15px; padding: 10px; background: rgba(52, 152, 219, 0.2); border-radius: 5px;">
                        <strong style="color: #3498db;">圖集尺寸：</strong>
                        <span id="preview-size-info" style="color: #ecf0f1;"></span>
                    </div>
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        <button id="confirm-download-btn" style="padding: 12px 24px; background: #2ecc71; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">⬇️ 確認下載</button>
                        <button id="back-edit-btn" style="padding: 12px 24px; background: #3498db; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">↩️ 返回編輯</button>
                        <button id="cancel-preview-btn" style="padding: 12px 24px; background: #95a5a6; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">❌ 取消</button>
                    </div>
                </div>
                
                <div id="tile-list" style="margin-top: 20px; color: #ecf0f1;"></div>
            </div>
        `;
        
        const img = container.querySelector('img');
        const overlayCanvas = container.querySelector('#overlay-canvas');
        const overlayCtx = overlayCanvas.getContext('2d');
        
        let scaleRatio = 1;
        
        img.onload = () => {
            const displayWidth = img.clientWidth;
            const displayHeight = img.clientHeight;
            const naturalWidth = img.naturalWidth;
            const naturalHeight = img.naturalHeight;
            
            scaleRatio = naturalWidth / displayWidth;
            
            overlayCanvas.width = displayWidth;
            overlayCanvas.height = displayHeight;
            overlayCanvas.style.width = displayWidth + 'px';
            overlayCanvas.style.height = displayHeight + 'px';
            
            console.log(`图片缩放比例: ${scaleRatio.toFixed(2)} (显示: ${displayWidth}x${displayHeight}, 原始: ${naturalWidth}x${naturalHeight})`);
        };
        
        const tilePositions = [];
        let isAddingTile = false;
        let startX = 0, startY = 0;
        let selectedIndex = -1;
        let isDragging = false;
        let dragEdge = null;
        
        window.tilePositions = tilePositions;
        window.drawTileBoxesCallback = (newIndex) => {
            selectedIndex = newIndex;
            this.drawTileBoxes(overlayCtx, tilePositions, selectedIndex, scaleRatio);
            deleteBtn.style.display = 'inline-block';
        };
        
const layoutModeSelect = container.querySelector('#layout-mode');
        const customInputs = container.querySelector('#custom-size-inputs');
        const customColsInput = container.querySelector('#custom-cols');
        const customRowsInput = container.querySelector('#custom-rows');
        const applyCustomBtn = container.querySelector('#apply-custom-btn');
        const addTileBtn = container.querySelector('#add-tile-btn');
        const undoBtn = container.querySelector('#undo-btn');
        const deleteBtn = container.querySelector('#delete-btn');
        
        const tileSizeInput = container.querySelector('#tile-size-input');
        const usePaddingCheckbox = container.querySelector('#use-padding-checkbox');
        const sizeModeSelect = container.querySelector('#size-mode');
        const previewResult = container.querySelector('#preview-result');
        const previewCanvas = container.querySelector('#preview-canvas');
        const previewSizeInfo = container.querySelector('#preview-size-info');
        const confirmDownloadBtn = container.querySelector('#confirm-download-btn');
        const backEditBtn = container.querySelector('#back-edit-btn');
        const cancelPreviewBtn = container.querySelector('#cancel-preview-btn');
        
        let currentDataUrl = null;
        
        sizeModeSelect.addEventListener('change', (e) => {
            this.preserveOriginalSize = e.target.value === 'preserve';
            this.updateTileList(container.querySelector('#tile-list'), tilePositions, selectedIndex);
        });
        
        tileSizeInput.addEventListener('change', (e) => {
            this.tileSize = parseInt(e.target.value) || 32;
            this.updateTileList(container.querySelector('#tile-list'), tilePositions);
            
            const infoDiv = container.querySelector('.info-message');
            if (infoDiv) {
                infoDiv.innerHTML = `
                    <strong style="color: #2ecc71;">💡 正方形尺寸計算：</strong>
                    <span style="color: #ecf0f1;">
                        ${this.usePadding ? '啟用 2px 間距' : '關閉間距'} → 
                        <strong style="color: #f1c40f;">${this.tileSize}x${this.tileSize} 素材</strong> → 
                        <strong style="color: #3498db;">${this.usePadding ? '有間距' : '完美正方形'}</strong>
                        （如 3x3 = ${3 * (this.tileSize + this.padding)}x${3 * (this.tileSize + this.padding)}px）
                    </span>
                `;
            }
        });
        
        usePaddingCheckbox.addEventListener('change', (e) => {
            this.setUsePadding(e.target.checked);
            this.updateTileList(container.querySelector('#tile-list'), tilePositions);
            
            const infoDiv = container.querySelector('.info-message');
            if (infoDiv) {
                infoDiv.innerHTML = `
                    <strong style="color: #2ecc71;">💡 正方形尺寸計算：</strong>
                    <span style="color: #ecf0f1;">
                        ${this.usePadding ? '啟用 2px 間距' : '關閉間距'} → 
                        <strong style="color: #f1c40f;">${this.tileSize}x${this.tileSize} 素材</strong> → 
                        <strong style="color: #3498db;">${this.usePadding ? '有間距' : '完美正方形'}</strong>
                        （如 3x3 = ${3 * (this.tileSize + this.padding)}x${3 * (this.tileSize + this.padding)}px）
                    </span>
                `;
            }
        });
        
        layoutModeSelect.addEventListener('change', (e) => {
            const mode = e.target.value;
            this.setLayoutMode(mode);
            
            if (mode === 'custom') {
                customInputs.style.display = 'block';
            } else {
                customInputs.style.display = 'none';
            }
            
            this.updateTileList(container.querySelector('#tile-list'), tilePositions);
        });
        
        applyCustomBtn.addEventListener('click', () => {
            const cols = parseInt(customColsInput.value) || 8;
            const rows = parseInt(customRowsInput.value) || 8;
            this.setLayoutMode('custom', cols, rows);
            this.updateTileList(container.querySelector('#tile-list'), tilePositions);
        });
        
        addTileBtn.addEventListener('click', () => {
            if (isAddingTile) {
                isAddingTile = false;
                overlayCanvas.style.pointerEvents = 'none';
                overlayCanvas.style.cursor = 'default';
                addTileBtn.textContent = '➕ 新增素材位置';
                addTileBtn.style.background = '#3498db';
            } else {
                isAddingTile = true;
                selectedIndex = -1;
                overlayCanvas.style.pointerEvents = 'auto';
                overlayCanvas.style.cursor = 'crosshair';
                addTileBtn.textContent = '🎯 请在设计稿上框选素材区域（再点击取消）';
                addTileBtn.style.background = '#f39c12';
                this.drawTileBoxes(overlayCtx, tilePositions, selectedIndex);
            }
        });
        
        undoBtn.addEventListener('click', () => {
            if (tilePositions.length > 0) {
                tilePositions.pop();
                selectedIndex = -1;
                this.drawTileBoxes(overlayCtx, tilePositions, selectedIndex);
                this.updateTileList(container.querySelector('#tile-list'), tilePositions);
                deleteBtn.style.display = 'none';
            }
        });
        
        deleteBtn.addEventListener('click', () => {
            if (selectedIndex >= 0 && selectedIndex < tilePositions.length) {
                tilePositions.splice(selectedIndex, 1);
                selectedIndex = -1;
                this.drawTileBoxes(overlayCtx, tilePositions, selectedIndex);
                this.updateTileList(container.querySelector('#tile-list'), tilePositions);
                deleteBtn.style.display = 'none';
            }
        });
        
        overlayCanvas.addEventListener('click', (e) => {
            if (isAddingTile) return;
            
            const rect = overlayCanvas.getBoundingClientRect();
            const displayX = e.clientX - rect.left;
            const displayY = e.clientY - rect.top;
            
            const clickX = Math.round(displayX * scaleRatio);
            const clickY = Math.round(displayY * scaleRatio);
            
            let clickedIndex = -1;
            for (let i = tilePositions.length - 1; i >= 0; i--) {
                const tile = tilePositions[i];
                if (clickX >= tile.x && clickX <= tile.x + tile.width &&
                    clickY >= tile.y && clickY <= tile.y + tile.height) {
                    clickedIndex = i;
                    break;
                }
            }
            
            if (clickedIndex !== -1) {
                selectedIndex = clickedIndex;
                this.drawTileBoxes(overlayCtx, tilePositions, selectedIndex, scaleRatio);
                deleteBtn.style.display = 'inline-block';
            } else {
                selectedIndex = -1;
                this.drawTileBoxes(overlayCtx, tilePositions, selectedIndex, scaleRatio);
                deleteBtn.style.display = 'none';
            }
        });
        
        overlayCanvas.addEventListener('mousedown', (e) => {
            if (!isAddingTile) return;
            
            const rect = overlayCanvas.getBoundingClientRect();
            const displayX = e.clientX - rect.left;
            const displayY = e.clientY - rect.top;
            
            startX = Math.round(displayX * scaleRatio);
            startY = Math.round(displayY * scaleRatio);
        });
        
        overlayCanvas.addEventListener('mouseup', (e) => {
            if (!isAddingTile) return;
            
            const rect = overlayCanvas.getBoundingClientRect();
            const displayX = e.clientX - rect.left;
            const displayY = e.clientY - rect.top;
            
            const endX = Math.round(displayX * scaleRatio);
            const endY = Math.round(displayY * scaleRatio);
            
            const width = Math.abs(endX - startX);
            const height = Math.abs(endY - startY);
            
            if (width < 5 || height < 5) {
                return;
            }
            
            const tile = {
                x: Math.min(startX, endX),
                y: Math.min(startY, endY),
                width: width,
                height: height
            };
            
            tilePositions.push(tile);
            selectedIndex = tilePositions.length - 1;
            this.drawTileBoxes(overlayCtx, tilePositions, selectedIndex, scaleRatio);
            this.updateTileList(container.querySelector('#tile-list'), tilePositions, selectedIndex);
            
            isAddingTile = false;
            overlayCanvas.style.pointerEvents = 'none';
            overlayCanvas.style.cursor = 'default';
            addTileBtn.textContent = '➕ 新增素材位置';
            addTileBtn.style.background = '#3498db';
            deleteBtn.style.display = 'none';
        });
        
        const saveBtn = container.querySelector('#save-tileset-btn');
        saveBtn.textContent = '👀 预览图集';
        saveBtn.style.background = '#f39c12';
        
        saveBtn.addEventListener('click', async () => {
            if (tilePositions.length === 0) {
                alert('请先框选素材区域！');
                return;
            }
            
            const dataUrl = await this.cleanAndGenerate(sourceImage, tilePositions);
            currentDataUrl = dataUrl;
            
            const previewImg = new Image();
            previewImg.onload = () => {
                previewCanvas.width = previewImg.width;
                previewCanvas.height = previewImg.height;
                
                const previewCtx = previewCanvas.getContext('2d');
                previewCtx.drawImage(previewImg, 0, 0);
                
                previewCtx.strokeStyle = '#f1c40f';
                previewCtx.lineWidth = 1;
                
                let cellSize = this.generatedCellSize || this.tileSize;
                const cols = previewCanvas.width / cellSize;
                const rows = previewCanvas.height / cellSize;
                
                for (let col = 0; col <= cols; col++) {
                    previewCtx.beginPath();
                    previewCtx.moveTo(col * cellSize, 0);
                    previewCtx.lineTo(col * cellSize, previewCanvas.height);
                    previewCtx.stroke();
                }
                
                for (let row = 0; row <= rows; row++) {
                    previewCtx.beginPath();
                    previewCtx.moveTo(0, row * cellSize);
                    previewCtx.lineTo(previewCanvas.width, row * cellSize);
                    previewCtx.stroke();
                }
                
                previewCtx.font = 'bold 12px Arial';
                previewCtx.fillStyle = '#f1c40f';
                previewCtx.textAlign = 'center';
                
                for (let row = 0; row < rows; row++) {
                    for (let col = 0; col < cols; col++) {
                        const index = row * cols + col + 1;
                        const x = col * cellSize + cellSize / 2;
                        const y = row * cellSize + cellSize / 2;
                        previewCtx.fillText(`#${index}`, x, y);
                    }
                }
                
                const sizeModeDesc = this.preserveOriginalSize 
                    ? '保留原始尺寸' 
                    : '縮放為 ' + this.tileSize + 'x' + this.tileSize;
                    
                previewSizeInfo.textContent = `${previewCanvas.width}x${previewCanvas.height}px (${cols.toFixed(0)}x${rows.toFixed(0)} 格，每格 ${cellSize}px，共 ${tilePositions.length} 個素材，${sizeModeDesc})`;
                
                previewResult.style.display = 'block';
            };
            previewImg.src = dataUrl;
        });
        
        confirmDownloadBtn.addEventListener('click', () => {
            if (currentDataUrl) {
                this.downloadCleanTileset(currentDataUrl);
                previewResult.style.display = 'none';
            }
        });
        
        backEditBtn.addEventListener('click', () => {
            previewResult.style.display = 'none';
        });
        
        cancelPreviewBtn.addEventListener('click', () => {
            previewResult.style.display = 'none';
            currentDataUrl = null;
        });
        
        container.querySelector('#clear-btn').addEventListener('click', () => {
            tilePositions.length = 0;
            selectedIndex = -1;
            overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
            this.updateTileList(container.querySelector('#tile-list'), tilePositions);
            deleteBtn.style.display = 'none';
        });
        
        this.updateTileList(container.querySelector('#tile-list'), tilePositions);
        
        window.addEventListener('resize', () => {
            if (img.complete) {
                const displayWidth = img.clientWidth;
                const displayHeight = img.clientHeight;
                scaleRatio = img.naturalWidth / displayWidth;
                
                overlayCanvas.width = displayWidth;
                overlayCanvas.height = displayHeight;
                overlayCanvas.style.width = displayWidth + 'px';
                overlayCanvas.style.height = displayHeight + 'px';
                
                this.drawTileBoxes(overlayCtx, tilePositions, selectedIndex, scaleRatio);
            }
        });
    }
    
    /**
     * 繪製素材方塊
     * @param {CanvasRenderingContext2D} ctx - Canvas 渲染上下文
     * @param {Array} tiles - 素材位置陣列
     * @param {number} [selectedIndex=-1] - 選中的素材索引
     * @param {number} [scaleRatio=1] - 縮放比例
     * @returns {void}
     */
    drawTileBoxes(ctx, tiles, selectedIndex = -1, scaleRatio = 1) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        tiles.forEach((tile, index) => {
            const isSelected = index === selectedIndex;
            
            const displayX = tile.x / scaleRatio;
            const displayY = tile.y / scaleRatio;
            const displayWidth = tile.width / scaleRatio;
            const displayHeight = tile.height / scaleRatio;
            
            ctx.strokeStyle = isSelected ? '#e74c3c' : '#2ecc71';
            ctx.lineWidth = isSelected ? 3 : 2;
            ctx.strokeRect(displayX, displayY, displayWidth, displayHeight);
            
            ctx.fillStyle = isSelected 
                ? 'rgba(231, 76, 60, 0.3)' 
                : 'rgba(46, 204, 113, 0.2)';
            ctx.fillRect(displayX, displayY, displayWidth, displayHeight);
            
            ctx.fillStyle = isSelected ? '#e74c3c' : '#f1c40f';
            ctx.font = 'bold 14px Arial';
            ctx.fillText(`#${index + 1}`, displayX + 5, displayY + 20);
            
            if (isSelected) {
                ctx.fillStyle = '#ecf0f1';
                ctx.font = '12px Arial';
                ctx.fillText(`點擊刪除或拖曳調整`, displayX + 5, displayY + 35);
                
                ctx.font = '10px Arial';
                ctx.fillStyle = '#95a5a6';
                ctx.fillText(`原圖: (${tile.x}, ${tile.y}) ${tile.width}x${tile.height}`, displayX + 5, displayY + displayHeight - 5);
            }
        });
    }
    
    /**
     * 更新素材列表顯示
     * @param {HTMLElement} container - 容器元素
     * @param {Array} tiles - 素材位置陣列
     * @param {number} [selectedIndex=-1] - 選中的素材索引
     * @returns {void}
     */
    updateTileList(container, tiles, selectedIndex = -1) {
        const layout = this.calculateLayout(tiles.length);
        const { cols, rows, isSquare } = layout;
        
        let cellSize = this.tileSize + this.padding;
        let sizeDesc = '';
        
        if (this.preserveOriginalSize && tiles.length > 0) {
            let maxWidth = 0;
            let maxHeight = 0;
            tiles.forEach(tile => {
                maxWidth = Math.max(maxWidth, tile.width);
                maxHeight = Math.max(maxHeight, tile.height);
            });
            cellSize = Math.max(maxWidth, maxHeight) + this.padding;
            sizeDesc = `${cols * cellSize}x${rows * cellSize}px（${cols}x${rows} 格，每格 ${cellSize}px，保留原始尺寸）`;
        } else {
            const canvasWidth = cols * cellSize;
            const canvasHeight = rows * cellSize;
            sizeDesc = this.usePadding 
                ? `${canvasWidth}x${canvasHeight}px（${cols}格 x ${rows}格，每格 ${cellSize}px）`
                : `${canvasWidth}x${canvasHeight}px（${cols}素材 x ${rows}素材，每素材 ${this.tileSize}px）`;
        }
        
        const canvasWidth = cols * cellSize;
        const canvasHeight = rows * cellSize;
        const totalSlots = cols * rows;
        const emptySlots = totalSlots - tiles.length;
        
        const perfectSquare = canvasWidth === canvasHeight;
        
        const layoutDesc = {
            'optimal': '🎯 最優布局',
            'square': '⬜ 強制正方形',
            'horizontal': '━ 水平排列',
            'vertical': '┃ 垂直排列',
            'custom': '⚙️ 自定義尺寸'
        };
        
        const warningText = !this.usePadding && perfectSquare
            ? `<span style="color: #2ecc71;">✅ 完美正方形</span>`
            : this.usePadding && perfectSquare
                ? `<span style="color: #f39c12;">⚠️ 有間距的正方形（${canvasWidth}x${canvasHeight}px）</span>`
                : emptySlots > 0 && emptySlots < 5 
                    ? `<span style="color: #e74c3c;">⚠️ 只有 ${emptySlots} 格空白，建議使用「自定義尺寸」預留更多空間</span>`
                    : emptySlots > 0 
                        ? `<span style="color: #f39c12;">（${emptySlots} 格空白，可預留給未來素材）</span>`
                        : `<span style="color: #2ecc71;">✅ 完美填滿</span>`;
        
        container.innerHTML = tiles.length === 0 
            ? '<p style="color: #95a5a6;">尚未添加任何素材位置</p>'
            : `
                <div style="margin-bottom: 15px; padding: 10px; background: rgba(46, 204, 113, 0.2); border-radius: 5px;">
                    <strong style="color: #2ecc71;">📊 統計資訊：</strong>
                    <span style="color: #ecf0f1;">
                        已選擇 <strong style="color: #f1c40f;">${tiles.length}</strong> 個素材 → 
                        <strong style="color: #3498db;">${layoutDesc[this.layoutMode]}</strong> → 
                        生成 <strong style="color: #9b59b6;">${sizeDesc}</strong>
                        ${warningText}
                    </span>
                </div>
                ${tiles.map((tile, index) => 
                    `<div style="margin: 5px 0; padding: 8px; background: rgba(52, 152, 219, 0.2); border-radius: 5px; ${selectedIndex === index ? 'border: 2px solid #e74c3c;' : ''}">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <strong style="color: #e74c3c; min-width: 40px;">#${index + 1}</strong>
                            
                            <label style="color: #95a5a6; font-size: 12px;">X:</label>
                            <input type="number" class="tile-input" data-index="${index}" data-field="x" value="${tile.x}" 
                                style="width: 60px; padding: 4px; background: #34495e; color: #ecf0f1; border: 1px solid #3498db; border-radius: 3px;">
                            
                            <label style="color: #95a5a6; font-size: 12px;">Y:</label>
                            <input type="number" class="tile-input" data-index="${index}" data-field="y" value="${tile.y}"
                                style="width: 60px; padding: 4px; background: #34495e; color: #ecf0f1; border: 1px solid #3498db; border-radius: 3px;">
                            
                            <label style="color: #95a5a6; font-size: 12px;">W:</label>
                            <input type="number" class="tile-input" data-index="${index}" data-field="width" value="${tile.width}"
                                style="width: 60px; padding: 4px; background: #34495e; color: #ecf0f1; border: 1px solid #3498db; border-radius: 3px;">
                            
                            <label style="color: #95a5a6; font-size: 12px;">H:</label>
                            <input type="number" class="tile-input" data-index="${index}" data-field="height" value="${tile.height}"
                                style="width: 60px; padding: 4px; background: #34495e; color: #ecf0f1; border: 1px solid #3498db; border-radius: 3px;">
                            
                            ${this.preserveOriginalSize 
                                ? `<span style="color: #2ecc71; font-size: 11px;">✓ 保留原始尺寸</span>`
                                : (tile.width !== this.tileSize || tile.height !== this.tileSize 
                                    ? `<span style="color: #f39c12; font-size: 11px;">→ ${this.tileSize}x${this.tileSize}</span>` 
                                    : `<span style="color: #2ecc71; font-size: 11px;">✓</span>`)}
                        </div>
                    </div>`
                ).join('')}
                
                <div style="margin-top: 10px; padding: 10px; background: rgba(241, 196, 15, 0.2); border-radius: 5px; border-left: 4px solid #f1c40f;">
                    <strong style="color: #f1c40f;">💡 提示：</strong>
                    <span style="color: #ecf0f1; font-size: 13px;">
                        ${this.preserveOriginalSize 
                            ? '選擇「保留原始尺寸」會保持每個素材的原始大小（如 72x72、64x96）'
                            : '選擇「縮放為統一尺寸」會將所有素材縮放為 ' + this.tileSize + 'x' + this.tileSize + '（可能變形或模糊）'}
                    </span>
                </div>
            `;
        
        const inputs = container.querySelectorAll('.tile-input');
        inputs.forEach(input => {
            input.addEventListener('change', (e) => {
                const index = parseInt(e.target.dataset.index);
                const field = e.target.dataset.field;
                const value = parseInt(e.target.value) || 0;
                
                if (window.tilePositions && window.tilePositions[index]) {
                    window.tilePositions[index][field] = value;
                }
            });
            
            input.addEventListener('focus', (e) => {
                const newSelectedIndex = parseInt(e.target.dataset.index);
                if (window.drawTileBoxesCallback) {
                    window.drawTileBoxesCallback(newSelectedIndex);
                }
            });
        });
    }
}