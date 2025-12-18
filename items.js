// 道具渲染和生成模块
import { CONFIG, COLORS } from './config.js';
import { gameState } from './state.js';
import { showMazeFullView, restartGame, updateUI } from './player.js';

// 生成门
export function generateDoor() {
    const possibleDoorPositions = [];
    
    // 遍历迷宫，寻找可能的门位置
    for (let y = 1; y < CONFIG.MAZE_HEIGHT - 1; y++) {
        for (let x = 1; x < CONFIG.MAZE_WIDTH - 1; x++) {
            // 门必须在墙壁上
            if (gameState.maze[y][x] === 1) {
                // 检查门是否连接两个通道
                // 门可以是水平或垂直方向
                const isHorizontalDoor = gameState.maze[y][x-1] === 0 && gameState.maze[y][x+1] === 0;
                const isVerticalDoor = gameState.maze[y-1][x] === 0 && gameState.maze[y+1][x] === 0;
                
                if (isHorizontalDoor || isVerticalDoor) {
                    possibleDoorPositions.push({ x, y });
                }
            }
        }
    }
    
    // 如果没有找到合适的位置，就在外围墙壁生成
    if (possibleDoorPositions.length === 0) {
        const side = Math.floor(Math.random() * 4);
        let doorX, doorY;
        
        switch(side) {
            case 0: // 上边界
                doorX = Math.floor(Math.random() * (CONFIG.MAZE_WIDTH - 2)) + 1;
                doorY = 0;
                break;
            case 1: // 右边界
                doorX = CONFIG.MAZE_WIDTH - 1;
                doorY = Math.floor(Math.random() * (CONFIG.MAZE_HEIGHT - 2)) + 1;
                break;
            case 2: // 下边界
                doorX = Math.floor(Math.random() * (CONFIG.MAZE_WIDTH - 2)) + 1;
                doorY = CONFIG.MAZE_HEIGHT - 1;
                break;
            case 3: // 左边界
                doorX = 0;
                doorY = Math.floor(Math.random() * (CONFIG.MAZE_HEIGHT - 2)) + 1;
                break;
        }
        
        gameState.door = { x: doorX, y: doorY };
    } else {
        // 从可能的位置中随机选择一个
        const randomIndex = Math.floor(Math.random() * possibleDoorPositions.length);
        gameState.door = possibleDoorPositions[randomIndex];
    }
    
    // 门的位置设为通路
    gameState.maze[gameState.door.y][gameState.door.x] = 0;
}

// 生成钥匙
export function generateKey() {
    // 生成钥匙（在迷宫内部随机位置）
    let keyX, keyY;
    do {
        keyX = Math.floor(Math.random() * CONFIG.MAZE_WIDTH);
        keyY = Math.floor(Math.random() * CONFIG.MAZE_HEIGHT);
    } while (gameState.maze[keyY][keyX] === 1 || (keyX === 1 && keyY === 1)); // 确保在通路上且不在起点
    
    gameState.key = { 
        x: keyX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2, 
        y: keyY * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2 
    };
}

// 生成道具（火把和钥匙）
export function spawnItems() {
    // 生成钥匙
    generateKey();
    
    // 生成火把
    const torches = [];
    const possibleTorchPositions = [];
    
    // 收集所有可能生成火把的位置（通路，非起点，非门位置）
    for (let y = 0; y < CONFIG.MAZE_HEIGHT; y++) {
        for (let x = 0; x < CONFIG.MAZE_WIDTH; x++) {
            if (gameState.maze[y][x] === 0) {
                // 不在起点和门的位置生成火把
                if (!((x === 1 && y === 1) || (x === gameState.door.x && y === gameState.door.y))) {
                    possibleTorchPositions.push({
                        x: x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                        y: y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2
                    });
                }
            }
        }
    }
    
    // 随机打乱位置列表
    for (let i = possibleTorchPositions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [possibleTorchPositions[i], possibleTorchPositions[j]] = [possibleTorchPositions[j], possibleTorchPositions[i]];
    }
    
    // 根据当前关卡获取对应的火把数量，关卡越难火把越少
    const levelTorchCount = CONFIG.TORCH_COUNT_BY_LEVEL[gameState.currentLevel] || CONFIG.DEFAULT_TORCH_COUNT;
    const torchCount = Math.min(levelTorchCount, possibleTorchPositions.length);
    for (let i = 0; i < torchCount; i++) {
        torches.push(possibleTorchPositions[i]);
    }
    
    gameState.torches = torches;
}

// 渲染道具
export function renderItems(ctx) {
    // 渲染火把（更拟真）
    for (const torch of gameState.torches) {
        // 火把柄
        ctx.fillStyle = COLORS.TORCH_HANDLE;
        ctx.fillRect(torch.x - 3, torch.y - 10, 6, 20);
        
        // 火把顶部
        ctx.fillStyle = COLORS.TORCH_HEAD;
        ctx.fillRect(torch.x - 5, torch.y - 15, 10, 5);
        
        // 火把火焰效果（更拟真）
        ctx.fillStyle = COLORS.TORCH_FLAME_OUTER;
        ctx.beginPath();
        ctx.arc(torch.x, torch.y - 20, 10, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = COLORS.TORCH_FLAME_MIDDLE;
        ctx.beginPath();
        ctx.arc(torch.x, torch.y - 20, 8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = COLORS.TORCH_FLAME_INNER;
        ctx.beginPath();
        ctx.arc(torch.x, torch.y - 20, 6, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // 渲染钥匙（更拟真）
    if (gameState.key) {
        // 钥匙环
        ctx.fillStyle = COLORS.KEY;
        ctx.beginPath();
        ctx.arc(gameState.key.x, gameState.key.y - 8, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // 钥匙柄
        ctx.fillStyle = COLORS.KEY;
        ctx.fillRect(gameState.key.x - 3, gameState.key.y, 6, 15);
        
        // 钥匙齿
        ctx.fillStyle = COLORS.KEY;
        ctx.fillRect(gameState.key.x - 8, gameState.key.y + 5, 5, 3);
        ctx.fillRect(gameState.key.x + 6, gameState.key.y + 8, 5, 3);
        ctx.fillRect(gameState.key.x - 8, gameState.key.y + 12, 5, 3);
    }
}

// 更新火把燃烧时间
export function updateTorchTime(deltaTime, ctx) {
    const player = gameState.player;
    
    // 只有当玩家开始移动后，才开始倒计时火把时间
    if (gameState.hasStartedMoving) {
        // 减少火把燃烧时间（基于时间的减少）
        player.torchTime -= deltaTime / 1000; // 每秒减少1秒
        
        // 确保火把时间不会小于0
        player.torchTime = Math.max(0, player.torchTime);
        
        // 更新UI
        updateUI();
        
        // 当当前火把时间用完时
        if (player.torchTime <= 0) {
            // 如果还有备用火把，切换到下一个
            if (player.torches > 1) {
                player.torches--;
                player.torchTime = CONFIG.TORCH_BURN_TIME;
            } else {
                // 没有备用火把，游戏结束
                // 立即调用showMazeFullView，不使用setTimeout
                showMazeFullView();
                
                // 添加用户交互监听器
                const handleUserInteraction = () => {
                    // 移除事件监听器
                    document.removeEventListener('keydown', handleUserInteraction);
                    document.removeEventListener('click', handleUserInteraction);
                    
                    alert('火把熄灭了！你迷失在黑暗中...');
                    restartGame();
                };
                
                // 监听键盘和鼠标事件
                document.addEventListener('keydown', handleUserInteraction);
                document.addEventListener('click', handleUserInteraction);
            }
        }
    }
}