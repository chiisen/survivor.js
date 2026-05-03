export class TileManager {
    constructor() {
        this.tileset = null;
        this.tileSize = 32;
        this.tiles = new Map();
        this.loaded = false;
        
        this.tileDefinitions = {
            grass: { x: 0, y: 0, width: 32, height: 32 },
            grass2: { x: 32, y: 0, width: 32, height: 32 },
            grass3: { x: 64, y: 0, width: 32, height: 32 },
            dirt: { x: 0, y: 32, width: 32, height: 32 },
            dirt2: { x: 32, y: 32, width: 32, height: 32 },
            stone: { x: 0, y: 64, width: 32, height: 32 },
            stone2: { x: 32, y: 64, width: 32, height: 32 },
            water: { x: 0, y: 96, width: 32, height: 32 },
            water2: { x: 32, y: 96, width: 32, height: 32 },
            
            tree: { x: 160, y: 0, width: 64, height: 96 },
            bush: { x: 224, y: 0, width: 32, height: 32 },
            flower: { x: 256, y: 0, width: 32, height: 32 },
            flower2: { x: 288, y: 0, width: 32, height: 32 },
            rock: { x: 160, y: 96, width: 48, height: 48 },
            mushroom: { x: 224, y: 32, width: 32, height: 32 },
            
            fence_h: { x: 320, y: 0, width: 32, height: 32 },
            fence_v: { x: 352, y: 0, width: 32, height: 32 },
            fence_corner: { x: 384, y: 0, width: 32, height: 32 }
        };
    }
    
    async load() {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.tileset = img;
                this.loaded = true;
                resolve();
            };
            img.onerror = reject;
            img.src = 'images/地板與環境素材設計圖集.png';
        });
    }
    
    drawTile(ctx, tileName, x, y, scale = 1) {
        if (!this.loaded) return;
        
        const def = this.tileDefinitions[tileName];
        if (!def) return;
        
        ctx.drawImage(
            this.tileset,
            def.x, def.y, def.width, def.height,
            x, y, def.width * scale, def.height * scale
        );
    }
    
    drawTilesetGrid(ctx, width, height, highlightTile = null) {
        if (!this.loaded) return;
        
        ctx.drawImage(this.tileset, 0, 0);
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        
        const cols = Math.ceil(this.tileset.width / this.tileSize);
        const rows = Math.ceil(this.tileset.height / this.tileSize);
        
        for (let col = 0; col <= cols; col++) {
            ctx.beginPath();
            ctx.moveTo(col * this.tileSize, 0);
            ctx.lineTo(col * this.tileSize, this.tileset.height);
            ctx.stroke();
        }
        
        for (let row = 0; row <= rows; row++) {
            ctx.beginPath();
            ctx.moveTo(0, row * this.tileSize);
            ctx.lineTo(this.tileset.width, row * this.tileSize);
            ctx.stroke();
        }
        
        if (highlightTile && this.tileDefinitions[highlightTile]) {
            const def = this.tileDefinitions[highlightTile];
            ctx.strokeStyle = '#f1c40f';
            ctx.lineWidth = 3;
            ctx.strokeRect(def.x, def.y, def.width, def.height);
            
            ctx.fillStyle = 'rgba(241, 196, 15, 0.3)';
            ctx.fillRect(def.x, def.y, def.width, def.height);
        }
        
        ctx.font = '12px Arial';
        ctx.fillStyle = '#e74c3c';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = col * this.tileSize + this.tileSize / 2;
                const y = row * this.tileSize + this.tileSize / 2;
                ctx.fillText(`${col},${row}`, x, y);
            }
        }
    }
    
    listAllTiles() {
        console.log('=== TileManager 所有素材 ===');
        for (const [name, def] of Object.entries(this.tileDefinitions)) {
            console.log(`${name}: (${def.x}, ${def.y}) ${def.width}x${def.height}`);
        }
        return this.tileDefinitions;
    }
    
    drawMap(ctx, mapData, offsetX = 0, offsetY = 0, scale = 1) {
        if (!this.loaded) return;
        
        for (const row of mapData) {
            for (const tile of row.tiles) {
                this.drawTile(ctx, tile.name, tile.x + offsetX, tile.y + offsetY, scale);
            }
        }
    }
    
    generateRandomGround(width, height) {
        const mapData = [];
        const cols = Math.ceil(width / this.tileSize);
        const rows = Math.ceil(height / this.tileSize);
        
        const groundTiles = ['grass', 'grass2', 'grass3', 'dirt', 'dirt2'];
        
        for (let row = 0; row < rows; row++) {
            const rowData = { tiles: [] };
            for (let col = 0; col < cols; col++) {
                const randomTile = groundTiles[Math.floor(Math.random() * groundTiles.length)];
                rowData.tiles.push({
                    name: randomTile,
                    x: col * this.tileSize,
                    y: row * this.tileSize
                });
            }
            mapData.push(rowData);
        }
        
        return mapData;
    }
    
    addDecorations(mapData, count = 50) {
        const decorations = ['flower', 'flower2', 'bush', 'mushroom', 'rock'];
        const rows = mapData.length;
        const cols = mapData[0]?.tiles.length || 0;
        
        for (let i = 0; i < count; i++) {
            const row = Math.floor(Math.random() * rows);
            const col = Math.floor(Math.random() * cols);
            const decoration = decorations[Math.floor(Math.random() * decorations.length)];
            
            const baseTile = mapData[row].tiles[col];
            mapData[row].tiles.push({
                name: decoration,
                x: baseTile.x + Math.random() * 16,
                y: baseTile.y + Math.random() * 16
            });
        }
        
        return mapData;
    }
    
    drawTileWithVariation(ctx, baseTile, x, y, scale = 1) {
        const variations = this.getTileVariations(baseTile);
        const randomVar = variations[Math.floor(Math.random() * variations.length)];
        this.drawTile(ctx, randomVar, x, y, scale);
    }
    
    getTileVariations(baseTile) {
        const variations = {
            grass: ['grass', 'grass2', 'grass3'],
            dirt: ['dirt', 'dirt2'],
            stone: ['stone', 'stone2'],
            water: ['water', 'water2']
        };
        
        return variations[baseTile] || [baseTile];
    }
}