// 迷宫生成和渲染模块
import { CONFIG, COLORS } from './config.js';
import { gameState } from './state.js';

// 生成随机迷宫（使用递归回溯算法）
export function generateMaze() {
    // 初始化迷宫，所有格子都是墙壁
    const maze = Array(CONFIG.MAZE_HEIGHT).fill().map(() => 
        Array(CONFIG.MAZE_WIDTH).fill(1)
    );
    
    // 递归回溯生成迷宫
    function carve(x, y) {
        // 标记当前格子为通路
        maze[y][x] = 0;
        
        // 随机顺序尝试四个方向
        const directions = [
            { dx: 0, dy: -2 }, // 上
            { dx: 2, dy: 0 },  // 右
            { dx: 0, dy: 2 },  // 下
            { dx: -2, dy: 0 }  // 左
        ];
        
        // 打乱方向顺序
        for (let i = directions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [directions[i], directions[j]] = [directions[j], directions[i]];
        }
        
        // 尝试每个方向
        for (const dir of directions) {
            const nx = x + dir.dx;
            const ny = y + dir.dy;
            
            // 检查是否在边界内且未访问
            if (nx >= 0 && nx < CONFIG.MAZE_WIDTH && ny >= 0 && ny < CONFIG.MAZE_HEIGHT && maze[ny][nx] === 1) {
                // 打通当前格子到目标格子的墙壁
                maze[y + dir.dy / 2][x + dir.dx / 2] = 0;
                // 递归访问目标格子
                carve(nx, ny);
            }
        }
    }
    
    // 从(1,1)开始生成（奇数坐标确保边界）
    carve(1, 1);
    
    // 设置玩家初始位置（在通道中心）
    gameState.player.x = CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2; // 60
    gameState.player.y = CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2; // 60
    
    // 设置迷宫
    gameState.maze = maze;
    
    // 确保玩家初始位置在通路上
    gameState.maze[Math.floor(gameState.player.y / CONFIG.TILE_SIZE)][Math.floor(gameState.player.x / CONFIG.TILE_SIZE)] = 0;
    
    // 确保玩家初始位置有效
    console.log("玩家初始位置:", gameState.player.x, gameState.player.y);
}

// 渲染迷宫
export function renderMaze(ctx) {
    for (let y = 0; y < CONFIG.MAZE_HEIGHT; y++) {
        for (let x = 0; x < CONFIG.MAZE_WIDTH; x++) {
            if (gameState.maze[y][x] === 1) {
                // 渲染墙壁
                ctx.fillStyle = COLORS.WALL;
                ctx.fillRect(x * CONFIG.TILE_SIZE, y * CONFIG.TILE_SIZE, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
                
                // 添加墙壁边框效果
                ctx.strokeStyle = COLORS.WALL_BORDER;
                ctx.lineWidth = 2;
                ctx.strokeRect(x * CONFIG.TILE_SIZE, y * CONFIG.TILE_SIZE, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
            } else {
                // 渲染通路
                ctx.fillStyle = COLORS.PATH;
                ctx.fillRect(x * CONFIG.TILE_SIZE, y * CONFIG.TILE_SIZE, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
            }
        }
    }
    
    // 渲染门（更拟真）
    const doorX = gameState.door.x * CONFIG.TILE_SIZE;
    const doorY = gameState.door.y * CONFIG.TILE_SIZE;
    
    // 门的主体
    ctx.fillStyle = COLORS.DOOR;
    ctx.fillRect(doorX, doorY, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
    
    // 门的边框
    ctx.strokeStyle = COLORS.DOOR_DETAIL;
    ctx.lineWidth = 3;
    ctx.strokeRect(doorX, doorY, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
    
    // 门把手
    ctx.fillStyle = COLORS.DOOR_HANDLE;
    ctx.beginPath();
    ctx.arc(doorX + CONFIG.TILE_SIZE - 15, doorY + CONFIG.TILE_SIZE / 2, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // 门的纹理
    ctx.strokeStyle = COLORS.DOOR_DETAIL;
    ctx.lineWidth = 1;
    for (let i = 5; i < CONFIG.TILE_SIZE; i += 8) {
        ctx.beginPath();
        ctx.moveTo(doorX + i, doorY);
        ctx.lineTo(doorX + i, doorY + CONFIG.TILE_SIZE);
        ctx.stroke();
    }
    for (let i = 5; i < CONFIG.TILE_SIZE; i += 8) {
        ctx.beginPath();
        ctx.moveTo(doorX, doorY + i);
        ctx.lineTo(doorX + CONFIG.TILE_SIZE, doorY + i);
        ctx.stroke();
    }
}