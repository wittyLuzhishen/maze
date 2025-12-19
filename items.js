// 道具渲染和生成模块
import { CONFIG, COLORS } from './config.js';
import { gameState } from './state.js';
import { showMazeFullView, restartGame, updateUI } from './player.js';
import { showCustomDialog } from './game.js';

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

// 检查火把位置是否与墙壁重叠（包括火焰范围）
function isTorchPositionValid(torchX, torchY) {
    // 火把尺寸：柄宽6px，高20px；顶部宽10px，高5px；火焰高15px
    // 火把总高度：20px（柄）+ 5px（顶部）+ 15px（火焰）= 40px
    // 火把总宽度：10px（顶部最宽部分）
    
    const torchWidth = 10;  // 火把顶部宽度
    const torchHeight = 40; // 火把总高度（柄+顶部+火焰）
    
    // 计算火把的边界框
    const torchLeft = torchX - torchWidth / 2;
    const torchRight = torchX + torchWidth / 2;
    const torchTop = torchY - torchHeight;
    const torchBottom = torchY;
    
    // 将边界框转换为网格坐标
    const gridLeft = Math.floor(torchLeft / CONFIG.TILE_SIZE);
    const gridRight = Math.floor(torchRight / CONFIG.TILE_SIZE);
    const gridTop = Math.floor(torchTop / CONFIG.TILE_SIZE);
    const gridBottom = Math.floor(torchBottom / CONFIG.TILE_SIZE);
    
    // 检查边界框内的所有网格单元
    for (let y = gridTop; y <= gridBottom; y++) {
        for (let x = gridLeft; x <= gridRight; x++) {
            // 检查网格是否在迷宫范围内
            if (x >= 0 && x < CONFIG.MAZE_WIDTH && y >= 0 && y < CONFIG.MAZE_HEIGHT) {
                // 如果网格是墙壁，则火把位置无效
                if (gameState.maze[y][x] === 1) {
                    return false;
                }
            }
        }
    }
    
    return true;
}

// 生成道具（火把和钥匙）
export function spawnItems(torchCount = null) {
    // 生成钥匙
    generateKey();
    
    // 生成火把
    const torches = [];
    const possibleTorchPositions = [];
    
    // 收集所有可能生成火把的位置（通路，非起点，非门位置，且不与墙壁重叠）
    for (let y = 0; y < CONFIG.MAZE_HEIGHT; y++) {
        for (let x = 0; x < CONFIG.MAZE_WIDTH; x++) {
            if (gameState.maze[y][x] === 0) {
                // 不在起点和门的位置生成火把
                if (!((x === 1 && y === 1) || (x === gameState.door.x && y === gameState.door.y))) {
                    const torchX = x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
                    const torchY = y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
                    
                    // 检查火把位置是否有效（不与墙壁重叠）
                    if (isTorchPositionValid(torchX, torchY)) {
                        possibleTorchPositions.push({
                            x: torchX,
                            y: torchY
                        });
                    }
                }
            }
        }
    }
    
    // 随机打乱位置列表
    for (let i = possibleTorchPositions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [possibleTorchPositions[i], possibleTorchPositions[j]] = [possibleTorchPositions[j], possibleTorchPositions[i]];
    }
    
    // 如果未指定火把数量，则根据当前关卡获取对应的火把数量，关卡越难火把越少
    if (torchCount === null) {
        torchCount = CONFIG.TORCH_COUNT_BY_LEVEL[gameState.currentLevel] || CONFIG.DEFAULT_TORCH_COUNT;
    }
    
    const finalTorchCount = Math.min(torchCount, possibleTorchPositions.length);
    for (let i = 0; i < finalTorchCount; i++) {
        torches.push(possibleTorchPositions[i]);
    }
    
    gameState.torches = torches;
}

// 渲染道具
export function renderItems(ctx) {
    // 渲染火把（与玩家手持火把大小一致，但未点燃）
    for (const torch of gameState.torches) {
        // 火把木柄（添加木纹细节）
        ctx.fillStyle = COLORS.TORCH_HANDLE;
        ctx.fillRect(torch.x - 3, torch.y - 5, 6, 20);
        
        // 添加木纹效果
        ctx.strokeStyle = COLORS.TORCH_WOOD_GRAIN; // 深色木纹
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(torch.x - 2, torch.y - 3);
        ctx.lineTo(torch.x - 2, torch.y + 15);
        ctx.moveTo(torch.x + 2, torch.y - 3);
        ctx.lineTo(torch.x + 2, torch.y + 15);
        ctx.stroke();
        
        // 火把顶部（未点燃状态，添加更多细节）
        ctx.fillStyle = COLORS.TORCH_HEAD_UNLIT;
        ctx.beginPath();
        ctx.moveTo(torch.x - 5, torch.y - 5);
        ctx.lineTo(torch.x - 4, torch.y - 10);
        ctx.lineTo(torch.x + 4, torch.y - 10);
        ctx.lineTo(torch.x + 5, torch.y - 5);
        ctx.closePath();
        ctx.fill();
        
        // 添加顶部细节纹理
        ctx.fillStyle = COLORS.TORCH_TEXTURE; // 深色纹理
        ctx.beginPath();
        ctx.arc(torch.x, torch.y - 7, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // 添加缠绕物细节
        ctx.strokeStyle = COLORS.TORCH_WRAP; // 棕色缠绕物
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(torch.x - 3, torch.y);
        ctx.lineTo(torch.x + 3, torch.y);
        ctx.moveTo(torch.x - 3, torch.y + 5);
        ctx.lineTo(torch.x + 3, torch.y + 5);
        ctx.moveTo(torch.x - 3, torch.y + 10);
        ctx.lineTo(torch.x + 3, torch.y + 10);
        ctx.stroke();
        
        // 迷宫中的火把没有火焰（未点燃）
    }
    
    // 渲染钥匙（连续钥匙杆设计）
    if (gameState.key) {
        const key = gameState.key;
        const keySize = CONFIG.TILE_SIZE * 0.6;
        
        // 设置钥匙颜色
        ctx.fillStyle = COLORS.KEY;
        
        // 钥匙环（矩形外框）
        const ringWidth = keySize * 0.7;
        const ringHeight = keySize * 0.3;
        const ringX = key.x - ringWidth / 2;
        const ringY = key.y - keySize * 0.6;
        
        // 绘制钥匙环外框
        ctx.fillRect(ringX, ringY, ringWidth, ringHeight);
        
        // 钥匙环内部空心
        const holeWidth = ringWidth * 0.6;
        const holeHeight = ringHeight * 0.6;
        const holeX = key.x - holeWidth / 2;
        const holeY = ringY + (ringHeight - holeHeight) / 2;
        ctx.fillStyle = COLORS.BACKGROUND_BLACK;
        ctx.fillRect(holeX, holeY, holeWidth, holeHeight);
        
        // 恢复钥匙颜色
        ctx.fillStyle = COLORS.KEY;
        
        // 连续的钥匙杆（从钥匙环底部一直延伸到钥匙尖端）
        const keyShankWidth = keySize * 0.2;
        const keyShankHeight = keySize * 1.2;
        const keyShankX = key.x - keyShankWidth / 2;
        const keyShankY = ringY + ringHeight;
        ctx.fillRect(keyShankX, keyShankY, keyShankWidth, keyShankHeight);
        
        // 钥匙齿部（只在右侧，连接在钥匙杆上）
        const teethWidth = keySize * 0.4;
        const teethHeight = keySize * 0.2;
        const teethX = keyShankX + keyShankWidth; // 连接在钥匙杆的右侧边缘
        const teethY = keyShankY + keyShankHeight * 0.7;
        ctx.fillRect(teethX, teethY, teethWidth, teethHeight);
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
                // 将火把数量和火把寿命都设置为0
                player.torches = 0;
                player.torchTime = 0;
                
                // 更新UI显示
                updateUI();
                
                // 立即调用showMazeFullView，不使用setTimeout
                showMazeFullView();
                
                // 直接显示失败对话框，不需要等待用户交互
                setTimeout(async () => {
                    await showCustomDialog('游戏结束', '火把熄灭了！你迷失在黑暗中...', false);
                    restartGame();
                }, 100);
            }
        }
    }
}