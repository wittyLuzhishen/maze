// 玩家相关模块
import { CONFIG, COLORS, ENUMS } from './config.js';
import { gameState, keysPressed } from './state.js';
import { renderMaze } from './maze.js';
import { renderItems } from './items.js';

// 更新玩家位置
export function updatePlayer(deltaTime, ctx) {
    const player = gameState.player;
    let dx = 0, dy = 0;
    
    // 检查移动输入，使用枚举替代硬编码
    if (ENUMS.MOVEMENT_KEYS.UP.some(key => keysPressed[key])) {
        dy = -CONFIG.PLAYER_SPEED * deltaTime / 16; // 基于时间的移动
    }
    if (ENUMS.MOVEMENT_KEYS.DOWN.some(key => keysPressed[key])) {
        dy = CONFIG.PLAYER_SPEED * deltaTime / 16; // 基于时间的移动
    }
    if (ENUMS.MOVEMENT_KEYS.LEFT.some(key => keysPressed[key])) {
        dx = -CONFIG.PLAYER_SPEED * deltaTime / 16; // 基于时间的移动
    }
    if (ENUMS.MOVEMENT_KEYS.RIGHT.some(key => keysPressed[key])) {
        dx = CONFIG.PLAYER_SPEED * deltaTime / 16; // 基于时间的移动
    }
    
    // 碰撞检测
    if (dx !== 0 || dy !== 0) {
        // 玩家开始移动，设置标志
        gameState.hasStartedMoving = true;
        
        const newX = player.x + dx;
        const newY = player.y + dy;
        
        // 检查墙壁碰撞，考虑玩家尺寸
        if (!isWallCollision(newX, newY)) {
            player.x = newX;
            player.y = newY;
        }
    }
    
    // 检查火把收集
    checkTorchCollection();
    
    // 检查钥匙收集
    checkKeyCollection();
    
    // 检查门碰撞
    checkDoorCollision(ctx);
}

// 墙壁碰撞检测
export function isWallCollision(x, y) {
    const tileSize = CONFIG.TILE_SIZE;
    
    // 计算玩家中心所在的格子
    const centerGridX = Math.floor(x / tileSize);
    const centerGridY = Math.floor(y / tileSize);
    
    // 检查玩家是否在迷宫边界内
    if (centerGridX < 0 || centerGridX >= CONFIG.MAZE_WIDTH || centerGridY < 0 || centerGridY >= CONFIG.MAZE_HEIGHT) {
        return true;
    }
    
    // 只检查玩家中心所在的格子是否是墙壁
    // 这样玩家可以顺利通过通道
    return gameState.maze[centerGridY][centerGridX] === 1;
}

// 检查火把收集
export function checkTorchCollection() {
    const player = gameState.player;
    
    for (let i = gameState.torches.length - 1; i >= 0; i--) {
        const torch = gameState.torches[i];
        const distance = Math.hypot(player.x - torch.x, player.y - torch.y);
        
        if (distance < CONFIG.TILE_SIZE / 2) {
            // 收集火把，增加备用火把数量
            player.torches++;
            gameState.torches.splice(i, 1);
            updateUI();
        }
    }
}

// 检查钥匙收集
export function checkKeyCollection() {
    if (!gameState.key) return;
    
    const player = gameState.player;
    const distance = Math.hypot(player.x - gameState.key.x, player.y - gameState.key.y);
    
    if (distance < CONFIG.TILE_SIZE / 2) {
        // 收集钥匙
        player.hasKey = true;
        gameState.key = null;
        updateUI();
    }
}

// 检查门碰撞
export function checkDoorCollision(ctx) {
    const player = gameState.player;
    const doorX = gameState.door.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
    const doorY = gameState.door.y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
    
    const distance = Math.hypot(player.x - doorX, player.y - doorY);
    
    if (distance < CONFIG.TILE_SIZE / 2 && player.hasKey) {
        // 玩家找到钥匙并到达门口，游戏胜利
        showMazeFullView(ctx);
        alert('恭喜！你成功逃出了迷宫！');
        restartGame();
    }
}

// 渲染玩家
export function renderPlayer(ctx) {
    const player = gameState.player;
    const playerSize = CONFIG.PLAYER_SIZE;
    
    // 玩家身体（正方形，边长等于通道宽度）
    ctx.fillStyle = COLORS.PLAYER_BODY;
    ctx.fillRect(player.x - playerSize / 2, player.y - playerSize / 2, playerSize, playerSize);
    
    // 玩家头部（圆形，在正方形范围内）
    const headRadius = playerSize / 4;
    ctx.fillStyle = COLORS.PLAYER_HEAD;
    ctx.beginPath();
    ctx.arc(player.x, player.y - playerSize / 4, headRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // 眼睛（在正方形范围内）
    ctx.fillStyle = COLORS.PLAYER_EYE;
    const eyeSize = 3;
    ctx.beginPath();
    ctx.arc(player.x - headRadius / 2, player.y - playerSize / 4, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(player.x + headRadius / 2, player.y - playerSize / 4, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    
    // 嘴巴（在正方形范围内）
    ctx.strokeStyle = COLORS.PLAYER_MOUTH;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(player.x, player.y - playerSize / 4 + 3, headRadius / 3, 0, Math.PI);
    ctx.stroke();
    
    // 手臂（在正方形范围内）
    ctx.fillStyle = COLORS.PLAYER_ARM;
    ctx.fillRect(player.x - playerSize / 2 + 2, player.y - 5, 8, 15);
    ctx.fillRect(player.x + playerSize / 2 - 10, player.y - 5, 8, 15);
    
    // 腿部（在正方形范围内）
    ctx.fillStyle = COLORS.PLAYER_LEG;
    ctx.fillRect(player.x - playerSize / 3, player.y + playerSize / 4, playerSize / 6, playerSize / 4);
    ctx.fillRect(player.x + playerSize / 6, player.y + playerSize / 4, playerSize / 6, playerSize / 4);
    
    // 手持火把（在正方形范围内）
    if (player.torches > 0) {
        // 火把柄（在正方形范围内）
        ctx.fillStyle = COLORS.TORCH_HANDLE;
        ctx.fillRect(player.x + playerSize / 2 - 12, player.y - 5, 6, 20);
        
        // 火把顶部（在正方形范围内）
        ctx.fillStyle = COLORS.TORCH_HEAD;
        ctx.fillRect(player.x + playerSize / 2 - 14, player.y - 10, 10, 5);
        
        // 火把火焰（在正方形范围内）
        ctx.fillStyle = COLORS.TORCH_FLAME_OUTER;
        ctx.beginPath();
        ctx.arc(player.x + playerSize / 2 - 9, player.y - 15, 6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = COLORS.TORCH_FLAME_MIDDLE;
        ctx.beginPath();
        ctx.arc(player.x + playerSize / 2 - 9, player.y - 15, 4, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 展示迷宫全貌（去除黑暗）
export function showMazeFullView(ctx) {
    // 渲染整个迷宫，不应用照明效果
    renderMaze(ctx);
    renderItems(ctx);
    renderPlayer(ctx);
    
    // 停止游戏循环，保留当前画面
    gameState.isPlaying = false;
}

// 重启游戏
export function restartGame() {
    gameState.isPlaying = false;
    gameState.hasStartedMoving = false;  // 重置移动标志
    gameState.startTime = 0;            // 重置关卡开始时间
    gameState.elapsedTime = 0;          // 重置关卡用时
    gameState.player = {
        x: 0,
        y: 0,
        torches: CONFIG.INITIAL_TORCHES,
        torchTime: CONFIG.TORCH_BURN_TIME,
        hasKey: false
    };
    gameState.torches = [];
    gameState.key = null;
    gameState.door = null;
    
    document.getElementById('start-screen').classList.remove('hidden');
    updateUI();
}

// 更新UI显示
export function updateUI() {
    // 显示当前关卡
    document.getElementById('level-count').textContent = gameState.currentLevel;
    
    // 显示火把数量
    document.getElementById('torch-count').textContent = gameState.player.torches;
    
    // 确保火把时间不显示为负数，最低显示为0
    const displayTime = Math.max(0, Math.ceil(gameState.player.torchTime));
    document.getElementById('torch-time').textContent = displayTime;
    
    // 显示关卡用时，精确到整数
    const formattedElapsedTime = Math.floor(Math.max(0, gameState.elapsedTime));
    document.getElementById('level-time').textContent = formattedElapsedTime;
    
    // 显示钥匙状态
    document.getElementById('key-status').textContent = gameState.player.hasKey ? '已找到' : '未找到';
}