// 玩家相关模块
// 负责处理玩家的移动、渲染、碰撞检测和物品收集等功能
import { CONFIG, COLORS, ENUMS } from './config.js';
import { gameState, keysPressed } from './state.js';
import { renderMaze } from './maze.js';
import { renderItems } from './items.js';
import { stopGameLoop, showCustomDialog } from './game.js';

/**
 * 更新玩家位置
 * 根据用户输入更新玩家坐标，处理移动逻辑和碰撞检测
 * @param {number} deltaTime - 上一帧到当前帧的时间差(毫秒)，用于实现基于时间的移动
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D渲染上下文，用于门碰撞检测时的渲染
 */
export function updatePlayer(deltaTime, ctx) {
    const player = gameState.player;
    let dx = 0, dy = 0;
    
    // 检查移动输入，使用枚举替代硬编码
    // 根据按键状态计算移动方向和距离
    if (ENUMS.MOVEMENT_KEYS.UP.some(key => keysPressed[key])) {
        dy = -CONFIG.PLAYER_SPEED * deltaTime / 16; // 基于时间的移动，确保不同帧率下移动速度一致
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
    // 只有当玩家有移动输入时才进行碰撞检测
    if (dx !== 0 || dy !== 0) {
        // 玩家开始移动，设置标志和开始时间
        // 用于计算关卡用时和游戏统计
        if (!gameState.hasStartedMoving) {
            gameState.hasStartedMoving = true;
            gameState.moveStartTime = performance.now(); // 记录玩家开始移动的时间
        }
        
        const newX = player.x + dx;
        const newY = player.y + dy;
        
        // 检查墙壁碰撞，考虑玩家尺寸
        // 如果新位置没有碰撞，则更新玩家位置
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

/**
 * 墙壁碰撞检测
 * 检查指定坐标是否与墙壁或门发生碰撞
 * @param {number} x - 待检测的X坐标
 * @param {number} y - 待检测的Y坐标
 * @returns {boolean} true表示有碰撞，false表示无碰撞
 */
export function isWallCollision(x, y) {
    const tileSize = CONFIG.TILE_SIZE;
    const playerSize = CONFIG.PLAYER_SIZE;
    
    // 计算玩家正方形区域的四个角
    // 使用正方形碰撞检测，确保玩家完全位于通道内
    const left = x - playerSize / 2;
    const right = x + playerSize / 2;
    const top = y - playerSize / 2;
    const bottom = y + playerSize / 2;
    
    // 检查玩家正方形区域的所有四个角
    // 这种方法确保玩家不会卡在墙壁的角落
    const corners = [
        { x: left, y: top },      // 左上角
        { x: right, y: top },     // 右上角
        { x: left, y: bottom },   // 左下角
        { x: right, y: bottom }   // 右下角
    ];
    
    for (const corner of corners) {
        const gridX = Math.floor(corner.x / tileSize);
        const gridY = Math.floor(corner.y / tileSize);
        
        // 检查是否在迷宫边界内
        if (gridX < 0 || gridX >= CONFIG.MAZE_WIDTH || gridY < 0 || gridY >= CONFIG.MAZE_HEIGHT) {
            return true;
        }
        
        // 检查是否碰到墙壁
        if (gameState.maze[gridY][gridX] === 1) {
            return true;
        }
        
        // 检查是否碰到门（没有钥匙时不可穿越）
        if (gameState.door && gridX === gameState.door.x && gridY === gameState.door.y && !gameState.player.hasKey) {
            return true;
        }
    }
    
    return false;
}

/**
 * 检查火把收集
 * 检测玩家是否与迷宫中的火把发生碰撞，如果碰撞则收集火把
 */
export function checkTorchCollection() {
    const player = gameState.player;
    
    // 遍历所有火把，检查碰撞
    for (let i = gameState.torches.length - 1; i >= 0; i--) {
        const torch = gameState.torches[i];
        
        // 使用方形碰撞检测，与玩家碰撞检测保持一致
        // 确保碰撞检测的准确性和一致性
        const playerLeft = player.x - CONFIG.PLAYER_SIZE / 2;
        const playerRight = player.x + CONFIG.PLAYER_SIZE / 2;
        const playerTop = player.y - CONFIG.PLAYER_SIZE / 2;
        const playerBottom = player.y + CONFIG.PLAYER_SIZE / 2;
        
        // 火把的碰撞区域（比火把稍大，便于收集）
        // 稍微放大碰撞区域，提高游戏体验
        const torchSize = CONFIG.TILE_SIZE * 0.6; // 火把碰撞区域大小
        const torchLeft = torch.x - torchSize / 2;
        const torchRight = torch.x + torchSize / 2;
        const torchTop = torch.y - torchSize / 2;
        const torchBottom = torch.y + torchSize / 2;
        
        // 检查玩家和火把的方形碰撞
        // 使用AABB(轴对齐边界框)碰撞检测算法
        if (playerRight > torchLeft && 
            playerLeft < torchRight && 
            playerBottom > torchTop && 
            playerTop < torchBottom) {
            // 收集火把，增加备用火把数量
            player.torches++;
            gameState.torches.splice(i, 1); // 从数组中移除已收集的火把
            updateUI(); // 更新UI显示
        }
    }
}

/**
 * 检查钥匙收集
 * 检测玩家是否与钥匙发生碰撞，如果碰撞则收集钥匙
 */
export function checkKeyCollection() {
    if (!gameState.key) return; // 如果没有钥匙，直接返回
    
    const player = gameState.player;
    
    // 使用方形碰撞检测，与玩家碰撞检测保持一致
    const playerLeft = player.x - CONFIG.PLAYER_SIZE / 2;
    const playerRight = player.x + CONFIG.PLAYER_SIZE / 2;
    const playerTop = player.y - CONFIG.PLAYER_SIZE / 2;
    const playerBottom = player.y + CONFIG.PLAYER_SIZE / 2;
    
    // 钥匙的碰撞区域（比钥匙稍大，便于收集）
    const keySize = CONFIG.TILE_SIZE * 0.6; // 钥匙碰撞区域大小
    const keyLeft = gameState.key.x - keySize / 2;
    const keyRight = gameState.key.x + keySize / 2;
    const keyTop = gameState.key.y - keySize / 2;
    const keyBottom = gameState.key.y + keySize / 2;
    
    // 检查玩家和钥匙的方形碰撞
    if (playerRight > keyLeft && 
        playerLeft < keyRight && 
        playerBottom > keyTop && 
        playerTop < keyBottom) {
        // 收集钥匙
        player.hasKey = true;
        gameState.key = null; // 移除钥匙
        updateUI(); // 更新UI显示
    }
}

/**
 * 检查门碰撞
 * 检测玩家是否与门发生碰撞，如果碰撞且玩家有钥匙，则触发游戏胜利
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D渲染上下文，用于胜利时的渲染
 */
export function checkDoorCollision(ctx) {
    const player = gameState.player;
    
    // 使用方形碰撞检测（与玩家碰撞检测一致）
    const playerLeft = player.x - CONFIG.PLAYER_SIZE / 2;
    const playerRight = player.x + CONFIG.PLAYER_SIZE / 2;
    const playerTop = player.y - CONFIG.PLAYER_SIZE / 2;
    const playerBottom = player.y + CONFIG.PLAYER_SIZE / 2;
    
    const doorLeft = gameState.door.x * CONFIG.TILE_SIZE;
    const doorRight = doorLeft + CONFIG.TILE_SIZE;
    const doorTop = gameState.door.y * CONFIG.TILE_SIZE;
    const doorBottom = doorTop + CONFIG.TILE_SIZE;
    
    // 检查玩家和门的方形碰撞
    const isColliding = playerRight > doorLeft && 
                       playerLeft < doorRight && 
                       playerBottom > doorTop && 
                       playerTop < doorBottom;
    
    // 如果玩家与门碰撞且拥有钥匙，触发胜利条件
    if (isColliding && player.hasKey) {
        // 玩家找到钥匙并到达门口，游戏胜利
        // 立即调用showMazeFullView，不使用setTimeout
        showMazeFullView();
        
        // 添加用户交互监听器
        // 等待用户交互后显示胜利对话框
        const handleUserInteraction = async () => {
            // 移除事件监听器，避免重复触发
            document.removeEventListener('keydown', handleUserInteraction);
            document.removeEventListener('click', handleUserInteraction);
            
            // 显示胜利对话框
            await showCustomDialog('胜利！', '恭喜！你成功逃出了迷宫！', false);
            restartGame(); // 重新开始游戏
        };
        
        // 监听键盘和鼠标事件
        // 确保在用户交互后才显示对话框，避免阻塞游戏
        document.addEventListener('keydown', handleUserInteraction);
        document.addEventListener('click', handleUserInteraction);
    }
}

/**
 * 渲染玩家
 * 在Canvas上绘制玩家角色，包括身体、头部、手臂、腿部和手持火把
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D渲染上下文
 */
export function renderPlayer(ctx) {
    const player = gameState.player;
    const playerSize = CONFIG.PLAYER_SIZE;
    
    // 玩家身体（更逼真的身体形状）
    ctx.fillStyle = COLORS.PLAYER_BODY;
    // 使用圆角矩形作为身体
    const bodyWidth = playerSize * 0.7;
    const bodyHeight = playerSize * 0.6;
    const bodyX = player.x - bodyWidth / 2;
    const bodyY = player.y - bodyHeight / 4;
    
    ctx.beginPath();
    ctx.roundRect(bodyX, bodyY, bodyWidth, bodyHeight, 3);
    ctx.fill();
    
    // 玩家头部（更逼真的头部形状）
    const headRadius = playerSize / 3.5;
    ctx.fillStyle = COLORS.PLAYER_HEAD;
    ctx.beginPath();
    ctx.arc(player.x, player.y - playerSize / 3, headRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // 添加头发细节
    ctx.fillStyle = COLORS.PLAYER_HAIR; // 深色头发
    ctx.beginPath();
    ctx.arc(player.x, player.y - playerSize / 3 - headRadius / 2, headRadius * 0.8, Math.PI, 0);
    ctx.fill();
    
    // 眼睛（更逼真的眼睛）
    ctx.fillStyle = COLORS.PLAYER_EYE;
    const eyeSize = 2.5;
    const eyeY = player.y - playerSize / 3;
    
    // 左眼
    ctx.beginPath();
    ctx.ellipse(player.x - headRadius / 2.5, eyeY, eyeSize, eyeSize * 1.2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 右眼
    ctx.beginPath();
    ctx.ellipse(player.x + headRadius / 2.5, eyeY, eyeSize, eyeSize * 1.2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 眼睛高光
    ctx.fillStyle = COLORS.PLAYER_EYE_HIGHLIGHT;
    ctx.beginPath();
    ctx.arc(player.x - headRadius / 2.5 + 0.8, eyeY - 0.5, 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(player.x + headRadius / 2.5 + 0.8, eyeY - 0.5, 0.8, 0, Math.PI * 2);
    ctx.fill();
    
    // 嘴巴（更自然的微笑）
    ctx.strokeStyle = COLORS.PLAYER_MOUTH_LIPS; // 更自然的嘴唇颜色
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(player.x, player.y - playerSize / 3 + 4, headRadius / 3, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
    
    // 手臂（更逼真的手臂）
    ctx.fillStyle = COLORS.PLAYER_ARM;
    
    // 左臂（持火把的手臂，稍微抬起）
    const leftArmWidth = playerSize * 0.15;
    const leftArmHeight = playerSize * 0.5;
    const leftArmX = player.x - playerSize / 2 - leftArmWidth / 2;
    const leftArmY = player.y - playerSize / 6;
    
    ctx.save();
    ctx.translate(leftArmX + leftArmWidth / 2, leftArmY);
    ctx.rotate(-Math.PI / 6); // 向上抬起30度
    ctx.fillRect(-leftArmWidth / 2, 0, leftArmWidth, leftArmHeight);
    ctx.restore();
    
    // 右臂（自然下垂）
    const rightArmWidth = playerSize * 0.15;
    const rightArmHeight = playerSize * 0.45;
    const rightArmX = player.x + playerSize / 2 - rightArmWidth / 2;
    const rightArmY = player.y - playerSize / 6;
    
    ctx.fillRect(rightArmX, rightArmY, rightArmWidth, rightArmHeight);
    
    // 腿部（更逼真的腿部）
    ctx.fillStyle = COLORS.PLAYER_LEG;
    
    // 左腿
    const legWidth = playerSize * 0.18;
    const legHeight = playerSize * 0.4;
    const leftLegX = player.x - playerSize / 3;
    const leftLegY = player.y + playerSize / 4;
    
    ctx.fillRect(leftLegX, leftLegY, legWidth, legHeight);
    
    // 右腿
    const rightLegX = player.x + playerSize / 6;
    
    ctx.fillRect(rightLegX, leftLegY, legWidth, legHeight);
    
    // 鞋子
    ctx.fillStyle = COLORS.PLAYER_SHOE; // 深色鞋子
    
    // 左鞋
    ctx.fillRect(leftLegX - 2, leftLegY + legHeight, legWidth + 4, 4);
    
    // 右鞋
    ctx.fillRect(rightLegX - 2, leftLegY + legHeight, legWidth + 4, 4);
    
    // 手持火把（左手持火把，有点燃的火焰）
    if (player.torches > 0) {
        // 计算左手位置（考虑手臂旋转）
        const handX = player.x - playerSize / 2 - 10;
        const handY = player.y - playerSize / 6 - 5;
        
        // 火把柄（更逼真的木柄）
        ctx.fillStyle = COLORS.TORCH_HANDLE;
        ctx.beginPath();
        ctx.roundRect(handX - 3, handY, 6, 25, 1);
        ctx.fill();
        
        // 添加木纹
        ctx.strokeStyle = COLORS.TORCH_WOOD_GRAIN;
        ctx.lineWidth = 0.5;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(handX - 2 + i * 2, handY + 5);
            ctx.lineTo(handX - 2 + i * 2, handY + 20);
            ctx.stroke();
        }
        
        // 火把顶部（更逼真的燃烧头部）
        ctx.fillStyle = COLORS.TORCH_HEAD;
        ctx.beginPath();
        ctx.ellipse(handX, handY - 2, 6, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 火把火焰 - 更逼真的水滴状火焰（上尖下宽，点燃状态）
        // 外层火焰（橙黄色）
        ctx.fillStyle = COLORS.TORCH_FLAME_OUTER;
        ctx.beginPath();
        ctx.moveTo(handX, handY - 20); // 顶部尖点
        ctx.bezierCurveTo(
            handX - 6, handY - 10,  // 左上控制点
            handX + 6, handY - 10,  // 右上控制点
            handX, handY - 2        // 底部中点
        );
        ctx.closePath();
        ctx.fill();
        
        // 中层火焰（橙红色）
        ctx.fillStyle = COLORS.TORCH_FLAME_MIDDLE;
        ctx.beginPath();
        ctx.moveTo(handX, handY - 18); // 顶部尖点
        ctx.bezierCurveTo(
            handX - 4, handY - 10,  // 左上控制点
            handX + 4, handY - 10,  // 右上控制点
            handX, handY - 3        // 底部中点
        );
        ctx.closePath();
        ctx.fill();
        
        // 内层火焰（黄白色）
        ctx.fillStyle = COLORS.TORCH_FLAME_INNER;
        ctx.beginPath();
        ctx.moveTo(handX, handY - 15); // 顶部尖点
        ctx.bezierCurveTo(
            handX - 2, handY - 10,  // 左上控制点
            handX + 2, handY - 10,  // 右上控制点
            handX, handY - 4        // 底部中点
        );
        ctx.closePath();
        ctx.fill();
        
        // 火焰闪烁效果
        const flicker = Math.random() * 2 - 1; // -1到1的随机值
        ctx.save();
        ctx.translate(handX + flicker, 0);
        
        ctx.restore();
    }
}

/**
 * 展示迷宫全貌
 * 去除黑暗效果，显示整个迷宫的结构
 */
export function showMazeFullView() {
    console.log("显示迷宫全貌开始");
    
    // 设置游戏状态标志
    gameState.showFullMaze = true;
    gameState.isPlaying = false;
    
    // 停止游戏循环
    stopGameLoop();
    
    console.log("迷宫全貌显示完成");
}

/**
 * 重启游戏
 * 重置所有游戏状态，返回到开始界面
 */
export function restartGame() {
    gameState.isPlaying = false;
    gameState.hasStartedMoving = false;  // 重置移动标志
    gameState.showFullMaze = false;       // 重置迷宫全貌显示标志
    gameState.startTime = 0;            // 重置关卡开始时间
    gameState.moveStartTime = 0;        // 重置玩家开始移动的时间
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

/**
 * 更新UI显示
 * 更新界面上的关卡、火把数量、火把时间、关卡用时和钥匙状态显示
 */
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