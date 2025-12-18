// 主游戏文件，整合所有模块
import { CONFIG, COLORS } from './config.js';
import { gameState, keysPressed } from './state.js';
import { generateMaze, renderMaze } from './maze.js';
import { updatePlayer, renderPlayer, showMazeFullView, restartGame, updateUI } from './player.js';
import { spawnItems, renderItems, updateTorchTime, generateDoor } from './items.js';

// 画布和上下文
let canvas, ctx;

// 初始化游戏
function initGame() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // 响应式调整
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // 键盘事件监听
    document.addEventListener('keydown', (e) => {
        keysPressed[e.key.toLowerCase()] = true;
    });
    
    document.addEventListener('keyup', (e) => {
        keysPressed[e.key.toLowerCase()] = false;
    });
    
    // 开始按钮事件
    document.getElementById('start-button').addEventListener('click', startGame);
    
    // 游戏主循环
    gameLoop();
}

// 响应式调整画布大小
function resizeCanvas() {
    const gameContainer = document.getElementById('game-container');
    const containerWidth = gameContainer.clientWidth;
    const containerHeight = window.innerHeight * 0.9;
    
    const scale = Math.min(containerWidth / CONFIG.CANVAS_WIDTH, containerHeight / CONFIG.CANVAS_HEIGHT);
    
    canvas.style.transform = `scale(${scale})`;
    canvas.style.transformOrigin = 'center center';
}

// 开始游戏
function startGame() {
    document.getElementById('start-screen').classList.add('hidden');
    
    // 重置游戏状态
    gameState.hasStartedMoving = false; // 初始时不计时，直到玩家开始移动
    gameState.startTime = performance.now(); // 记录关卡开始时间
    gameState.elapsedTime = 0; // 重置关卡用时
    
    // 生成新迷宫（包括设置玩家初始位置）
    generateMaze();
    
    // 生成门
    generateDoor();
    
    // 生成道具（火把和钥匙）
    spawnItems();
    
    // 确保玩家位置已正确设置
    console.log("游戏开始时玩家位置:", gameState.player.x, gameState.player.y);
    
    // 最后设置游戏状态为正在播放
    gameState.isPlaying = true;
    
    // 启动游戏循环
    startGameLoop();
    
    // 更新UI
    updateUI();
}

// 更新游戏状态
function update(deltaTime) {
    if (!gameState.isPlaying) return;
    
    // 计算当前关卡用时（秒）
    const currentTime = performance.now();
    gameState.elapsedTime = (currentTime - gameState.startTime) / 1000;
    
    updatePlayer(deltaTime, ctx);
    updateTorchTime(deltaTime, ctx);
    
    // 更新UI，包括关卡用时
    updateUI();
}



// 渲染游戏
function render() {
    // 如果游戏没有开始，不渲染游戏内容
    if (!gameState.isPlaying) {
        // 如果需要显示迷宫全貌，则显示迷宫全貌
        if (gameState.showFullMaze) {
            // 清空画布为白色背景
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // 渲染迷宫
            renderMaze(ctx);
            
            // 渲染玩家位置（用红色标记）
            const player = gameState.player;
            ctx.fillStyle = '#ff0000';
            ctx.beginPath();
            ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
            ctx.fill();
            
            // 渲染门位置（用绿色标记）
            if (gameState.door) {
                ctx.fillStyle = '#00ff00';
                ctx.fillRect(
                    gameState.door.x * CONFIG.TILE_SIZE,
                    gameState.door.y * CONFIG.TILE_SIZE,
                    CONFIG.TILE_SIZE,
                    CONFIG.TILE_SIZE
                );
            }
            
            // 渲染钥匙位置（用黄色标记）
            if (gameState.key) {
                ctx.fillStyle = '#ffff00';
                ctx.beginPath();
                ctx.arc(gameState.key.x, gameState.key.y, 5, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // 添加提示信息
            ctx.fillStyle = '#000000';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('按任意键或点击鼠标继续', canvas.width / 2, canvas.height - 20);
            
            return;
        }
        
        // 清空画布为黑色
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        return;
    }
    
    // 首先渲染所有游戏元素到临时画布，确保游戏元素可见
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    // 清空临时画布为白色，这样游戏元素可见
    tempCtx.fillStyle = COLORS.WALL;
    tempCtx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 在临时画布上渲染所有游戏元素
    renderMaze(tempCtx);
    renderItems(tempCtx);
    renderPlayer(tempCtx);
    
    // 清空主画布为黑色
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 将临时画布绘制到主画布上
    ctx.drawImage(tempCanvas, 0, 0);
    
    // 只有在玩家位置有效且不需要显示迷宫全貌时才绘制照明效果
    if (gameState.player.x > 0 && gameState.player.y > 0 && !gameState.showFullMaze) {
        // 绘制黑色遮罩，只保留玩家周围的亮区
        ctx.globalCompositeOperation = 'destination-out';
        
        // 创建径向渐变遮罩
        const player = gameState.player;
        const gradient = ctx.createRadialGradient(
            player.x, player.y, 0,
            player.x, player.y, CONFIG.TORCH_LIGHT_RADIUS
        );
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)'); // 中心不遮罩
        gradient.addColorStop(0.6, 'rgba(0, 0, 0, 0.5)'); // 部分遮罩
        gradient.addColorStop(1, 'rgba(0, 0, 0, 1)'); // 完全遮罩
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 重置合成模式
        ctx.globalCompositeOperation = 'source-over';
    }
}

// 游戏主循环
let gameLoopId = null;

function gameLoop(timestamp) {
    // 如果游戏结束，停止循环
    if (!gameState.isPlaying) {
        // 取消动画帧请求
        if (gameLoopId) {
            cancelAnimationFrame(gameLoopId);
            gameLoopId = null;
        }
        
        // 如果显示迷宫全貌，立即渲染一次
        if (gameState.showFullMaze) {
            render();
        }
        
        return; // 停止游戏循环
    }
    
    // 计算时间差
    const deltaTime = timestamp - gameState.lastUpdateTime;
    gameState.lastUpdateTime = timestamp;
    
    update(deltaTime);
    render();
    gameLoopId = requestAnimationFrame(gameLoop);
}

// 启动游戏循环
function startGameLoop() {
    gameState.lastUpdateTime = performance.now();
    gameLoopId = requestAnimationFrame(gameLoop);
}

// 停止游戏循环
function stopGameLoop() {
    if (gameLoopId) {
        cancelAnimationFrame(gameLoopId);
        gameLoopId = null;
    }
    gameState.isPlaying = false;
}

// 导出函数供其他模块使用
export { stopGameLoop };

// 页面加载完成后初始化游戏
window.addEventListener('load', initGame);