/**
 * 主游戏文件，整合所有模块
 * 负责游戏初始化、主循环、事件处理和游戏状态管理
 */
import { CONFIG, COLORS, DIFFICULTY_CONFIG, ENUMS } from './config.js';
import { gameState, keysPressed } from './state.js';
import { generateMaze, renderMaze } from './maze.js';
import { updatePlayer, renderPlayer, showMazeFullView, restartGame, updateUI } from './player.js';
import { spawnItems, renderItems, updateTorchTime, generateDoor } from './items.js';

// 画布和上下文
let canvas, ctx;

// 当前难度设置
let currentDifficulty = ENUMS.DIFFICULTY_LEVELS.MEDIUM;
let lastSelectedDifficulty = ENUMS.DIFFICULTY_LEVELS.MEDIUM; // 记录最近选择的难度
let customSettings = null;

/**
 * 初始化游戏
 * 设置画布、事件监听器和UI元素
 */
function initGame() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // 设置画布实际尺寸
    canvas.width = CONFIG.CANVAS_WIDTH;
    canvas.height = CONFIG.CANVAS_HEIGHT;
    
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
    
    // 难度选择按钮事件
    setupDifficultySelection();
    
    // 设置中等难度为默认选中
    const mediumButton = document.querySelector('.difficulty-button[data-difficulty="medium"]');
    if (mediumButton) {
        mediumButton.classList.add('selected');
    }
    
    // 游戏控制按钮事件
    setupGameControls();
    
    // 初始化UI显示值
    document.getElementById('torch-time').textContent = CONFIG.TORCH_BURN_TIME;
    
    // 初始化自定义对话框
    initCustomDialog();
    
    // 游戏主循环
    gameLoop();
}

/**
 * 设置难度选择
 * 处理难度选择按钮的点击事件和自定义设置
 */
function setupDifficultySelection() {
    // 获取难度选择按钮
    const difficultyButtons = document.querySelectorAll('.difficulty-button');
    
    // 为每个按钮添加点击事件
    difficultyButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 移除所有按钮的选中状态
            difficultyButtons.forEach(btn => btn.classList.remove('selected'));
            
            // 添加当前按钮的选中状态
            button.classList.add('selected');
            
            // 获取选择的难度
            const difficulty = button.dataset.difficulty;
            currentDifficulty = difficulty;
            
            // 记录最近选择的非自定义难度
            if (difficulty !== ENUMS.DIFFICULTY_LEVELS.CUSTOM) {
                lastSelectedDifficulty = difficulty;
            }
            
            // 显示或隐藏自定义设置
            const customSettingsDiv = document.getElementById('custom-settings');
            if (difficulty === 'custom') {
                customSettingsDiv.classList.remove('hidden');
                // 初始化自定义设置为最近选择的难度参数
                initializeCustomSettings(lastSelectedDifficulty);
            } else {
                customSettingsDiv.classList.add('hidden');
            }
        });
    });
    
    // 所有滑块更新显示值
    const sliders = [
        { slider: 'custom-initial-torches', value: 'initial-torches-value' },
        { slider: 'custom-maze-torches', value: 'maze-torches-value' },
        { slider: 'custom-maze-width', value: 'maze-width-value' },
        { slider: 'custom-maze-height', value: 'maze-height-value' },
        { slider: 'custom-light-radius', value: 'light-radius-value' },
        { slider: 'custom-torch-time', value: 'torch-time-value' },
        { slider: 'custom-loop-rate', value: 'loop-rate-value' }
    ];
    
    sliders.forEach(({ slider, value }) => {
        const sliderElement = document.getElementById(slider);
        const valueElement = document.getElementById(value);
        
        sliderElement.addEventListener('input', () => {
            valueElement.textContent = sliderElement.value;
        });
        
        // 初始化显示值
        valueElement.textContent = sliderElement.value;
    });
}

/**
 * 初始化自定义设置为指定难度的参数
 * @param {string} difficulty - 难度级别 (easy/medium/hard)
 */
function initializeCustomSettings(difficulty) {
    const config = DIFFICULTY_CONFIG[difficulty];
    if (!config) return;
    
    // 设置各个滑块的值
    document.getElementById('custom-initial-torches').value = config.initialTorches;
    document.getElementById('initial-torches-value').textContent = config.initialTorches;
    
    document.getElementById('custom-maze-torches').value = config.mazeTorches;
    document.getElementById('maze-torches-value').textContent = config.mazeTorches;
    
    document.getElementById('custom-maze-width').value = config.mazeWidth;
    document.getElementById('maze-width-value').textContent = config.mazeWidth;
    
    document.getElementById('custom-maze-height').value = config.mazeHeight;
    document.getElementById('maze-height-value').textContent = config.mazeHeight;
    
    document.getElementById('custom-light-radius').value = config.torchLightRadius;
    document.getElementById('light-radius-value').textContent = config.torchLightRadius;
    
    document.getElementById('custom-torch-time').value = config.torchBurnTime;
    document.getElementById('torch-time-value').textContent = config.torchBurnTime;
    
    document.getElementById('custom-loop-rate').value = config.loopGenerationRate * 100; // 转换为百分比显示
    document.getElementById('loop-rate-value').textContent = config.loopGenerationRate * 100;
}

// 默认选择中等难度
document.querySelector('[data-difficulty="medium"]').click();


/**
 * 获取当前游戏设置
 * 根据选择的难度级别返回相应的游戏配置参数
 * @returns {Object} 包含游戏设置的对象
 */
function getCurrentGameSettings() {
    // 如果是自定义难度，从表单中获取设置
    if (currentDifficulty === ENUMS.DIFFICULTY_LEVELS.CUSTOM) {
        const initialTorches = parseInt(document.getElementById('custom-initial-torches').value);
        const mazeTorches = parseInt(document.getElementById('custom-maze-torches').value);
        const mazeWidth = parseInt(document.getElementById('custom-maze-width').value);
        const mazeHeight = parseInt(document.getElementById('custom-maze-height').value);
        const torchLightRadius = parseInt(document.getElementById('custom-light-radius').value);
        const torchBurnTime = parseInt(document.getElementById('custom-torch-time').value);
        const loopGenerationRate = parseInt(document.getElementById('custom-loop-rate').value) / 100; // 转换为小数
        
        return {
            initialTorches,
            mazeTorches,
            mazeWidth,
            mazeHeight,
            torchLightRadius,
            torchBurnTime,
            loopGenerationRate
        };
    } else {
        // 否则使用预设的难度配置
        return DIFFICULTY_CONFIG[currentDifficulty];
    }
}

/**
 * 响应式调整画布大小
 * 确保画布显示尺寸与实际尺寸一致
 */
function resizeCanvas() {
    // 画布尺寸固定，不进行缩放
    // 确保画布显示尺寸与实际尺寸一致
    canvas.style.width = CONFIG.CANVAS_WIDTH + 'px';
    canvas.style.height = CONFIG.CANVAS_HEIGHT + 'px';
    canvas.style.transform = 'none';
}

/**
 * 开始游戏
 * 初始化游戏状态，生成迷宫和道具，启动游戏循环
 */
function startGame() {
    document.getElementById('start-screen').classList.add('hidden');
    
    // 获取当前难度设置
    const gameSettings = getCurrentGameSettings();
    
    // 重置游戏状态
    gameState.hasStartedMoving = false; // 初始时不计时，直到玩家开始移动
    gameState.showFullMaze = false; // 重置迷宫全貌显示标志
    gameState.startTime = performance.now(); // 记录关卡开始时间
    gameState.moveStartTime = 0; // 重置玩家开始移动的时间
    gameState.elapsedTime = 0; // 重置关卡用时
    
    // 更新CONFIG中的游戏参数
    CONFIG.INITIAL_TORCHES = gameSettings.initialTorches;
    CONFIG.TORCH_BURN_TIME = gameSettings.torchBurnTime;
    CONFIG.TORCH_LIGHT_RADIUS = gameSettings.torchLightRadius;
    CONFIG.MAZE_WIDTH = gameSettings.mazeWidth;
    CONFIG.MAZE_HEIGHT = gameSettings.mazeHeight;
    CONFIG.LOOP_GENERATION_RATE = gameSettings.loopGenerationRate;
    
    // 设置画布尺寸以适应新的迷宫尺寸
    resizeCanvasForMaze();
    
    // 重置玩家状态（包括火把时间）
    gameState.player.torches = CONFIG.INITIAL_TORCHES;
    gameState.player.torchTime = CONFIG.TORCH_BURN_TIME;
    gameState.player.hasKey = false;
    
    // 生成新迷宫（包括设置玩家初始位置）
    generateMaze();
    
    // 生成门
    generateDoor();
    
    // 生成道具（火把和钥匙）
    spawnItems(gameSettings.mazeTorches);
    
    // 确保玩家位置已正确设置
    console.log("游戏开始时玩家位置:", gameState.player.x, gameState.player.y);
    
    // 更新状态栏的难度参数显示
    updateDifficultyDisplay(gameSettings);
    
    // 最后设置游戏状态为正在播放
    gameState.isPlaying = true;
    
    // 启动游戏循环
    startGameLoop();
    
    // 更新UI
    updateUI();
}

/**
 * 调整画布大小以适应迷宫尺寸
 * 根据迷宫的宽度和高度调整画布尺寸，如果迷宫太大则等比例缩小
 * 优化显示范围，使其更充分利用屏幕空间，确保操作按钮和状态栏始终可见
 */
function resizeCanvasForMaze() {
    // 计算原始迷宫尺寸
    const originalWidth = CONFIG.MAZE_WIDTH * CONFIG.TILE_SIZE;
    const originalHeight = CONFIG.MAZE_HEIGHT * CONFIG.TILE_SIZE;
    
    // 获取左侧控制按钮区域实际宽度
    const controlsElement = document.getElementById('game-controls');
    const controlsWidth = controlsElement ? controlsElement.offsetWidth : 120; // 默认120px
    
    // 获取右侧状态显示区域实际宽度
    const uiElement = document.getElementById('ui');
    const uiWidth = uiElement ? uiElement.offsetWidth : 120; // 默认120px
    
    // 计算可用显示区域，确保UI元素完全可见
    // 使用更小的边距，最大化迷宫显示区域
    const horizontalMargin = 5; // 水平边距5px
    const verticalMargin = 5;   // 垂直边距5px
    
    // 计算可用宽度和高度（考虑左右两侧UI元素）
    const availableWidth = window.innerWidth - controlsWidth - uiWidth - (horizontalMargin * 2);
    const availableHeight = window.innerHeight - (verticalMargin * 2);
    
    // 计算缩放比例
    let scale = 1;
    if (originalWidth > availableWidth || originalHeight > availableHeight) {
        // 计算两个方向的缩放比例，取较小值确保完整显示
        const scaleX = availableWidth / originalWidth;
        const scaleY = availableHeight / originalHeight;
        scale = Math.min(scaleX, scaleY, 1); // 不放大，只缩小
    }
    
    // 计算缩放后的画布尺寸
    const scaledWidth = Math.floor(originalWidth * scale);
    const scaledHeight = Math.floor(originalHeight * scale);
    
    // 更新CONFIG中的画布尺寸
    CONFIG.CANVAS_WIDTH = originalWidth; // 保存原始尺寸用于渲染计算
    CONFIG.CANVAS_HEIGHT = originalHeight;
    CONFIG.SCALE_FACTOR = scale; // 添加缩放因子
    
    // 设置画布实际尺寸（使用原始尺寸）
    canvas.width = originalWidth;
    canvas.height = originalHeight;
    
    // 设置画布显示尺寸（使用缩放后尺寸）
    canvas.style.width = scaledWidth + 'px';
    canvas.style.height = scaledHeight + 'px';
    
    // 更新游戏区域容器尺寸
    const gameArea = document.getElementById('game-area');
    gameArea.style.width = scaledWidth + 'px';
    gameArea.style.height = scaledHeight + 'px';
    
    // 游戏容器样式已在CSS中设置，不需要在这里修改
    // 保持游戏容器的默认布局，确保元素紧贴排列
    
    // 确保UI元素始终可见
    if (uiElement) {
        uiElement.style.position = 'relative';
        uiElement.style.zIndex = '10';
    }
    
    if (controlsElement) {
        controlsElement.style.position = 'relative';
        controlsElement.style.zIndex = '10';
    }
}

// 更新状态栏的难度参数显示
function updateDifficultyDisplay(gameSettings) {
    // 更新难度显示
    const difficultyNames = {
        easy: '简单',
        medium: '中等',
        hard: '困难',
        custom: '自定义'
    };
    document.getElementById('difficulty-display').textContent = difficultyNames[currentDifficulty];
    
    // 更新迷宫尺寸显示
    document.getElementById('maze-size-display').textContent = `${gameSettings.mazeWidth}×${gameSettings.mazeHeight}`;
    
    // 更新照明半径显示
    document.getElementById('light-radius-display').textContent = gameSettings.torchLightRadius;
}

// 设置游戏控制按钮
function setupGameControls() {
    // 暂停按钮
    document.getElementById('pause-button').addEventListener('click', togglePause);
    
    // 重新开始按钮
    document.getElementById('restart-button').addEventListener('click', restartCurrentGame);
    
    // 返回主界面按钮
    document.getElementById('back-to-main-button').addEventListener('click', backToMainMenu);
}

// 切换暂停状态
function togglePause() {
    const pauseButton = document.getElementById('pause-button');
    
    if (gameState.isPlaying && !gameState.isPaused) {
        // 暂停游戏
        gameState.isPaused = true;
        gameState.isPlaying = false;
        pauseButton.textContent = '继续';
        
        // 停止游戏循环
        if (gameLoopId) {
            cancelAnimationFrame(gameLoopId);
            gameLoopId = null;
        }
        
        // 显示暂停遮罩
        showPauseOverlay();
    } else if (gameState.isPaused) {
        // 继续游戏
        gameState.isPaused = false;
        gameState.isPlaying = true;
        pauseButton.textContent = '暂停';
        
        // 隐藏暂停遮罩
        hidePauseOverlay();
        
        // 重新启动游戏循环
        startGameLoop();
    }
}

// 显示暂停遮罩
function showPauseOverlay() {
    const existingOverlay = document.getElementById('pause-overlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }
    
    const overlay = document.createElement('div');
    overlay.id = 'pause-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: ${COLORS.UI_OVERLAY};
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        color: white;
        font-size: 48px;
        font-weight: bold;
        pointer-events: none;
    `;
    overlay.textContent = '游戏已暂停';
    document.body.appendChild(overlay);
}

// 隐藏暂停遮罩
function hidePauseOverlay() {
    const overlay = document.getElementById('pause-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// 重新开始游戏
async function restartCurrentGame() {
    const confirmed = await showCustomDialog('重新开始', '确定要重新开始当前游戏吗？');
    if (confirmed) {
        // 停止当前游戏
        if (gameLoopId) {
            cancelAnimationFrame(gameLoopId);
            gameLoopId = null;
        }
        
        // 隐藏暂停遮罩
        hidePauseOverlay();
        
        // 重新开始游戏
        startGame();
    }
}

// 返回主界面
async function backToMainMenu() {
    const confirmed = await showCustomDialog('返回主界面', '确定要返回主界面吗？当前游戏进度将丢失。');
    if (confirmed) {
        // 停止当前游戏
        if (gameLoopId) {
            cancelAnimationFrame(gameLoopId);
            gameLoopId = null;
        }
        
        // 隐藏暂停遮罩
        hidePauseOverlay();
        
        // 重置游戏状态
        gameState.isPlaying = false;
        gameState.isPaused = false;
        
        // 显示主界面
        document.getElementById('start-screen').classList.remove('hidden');
        document.getElementById('pause-button').textContent = '暂停';
    }
}

// 更新游戏状态
function update(deltaTime) {
    if (!gameState.isPlaying) return;
    
    // 计算当前关卡用时（秒）- 从玩家第一次按下方向键开始计时
    const currentTime = performance.now();
    if (gameState.hasStartedMoving) {
        gameState.elapsedTime = (currentTime - gameState.moveStartTime) / 1000;
    } else {
        gameState.elapsedTime = 0;
    }
    
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
            ctx.fillStyle = COLORS.BACKGROUND_WHITE;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // 渲染迷宫
            renderMaze(ctx);
            
            // 渲染所有道具（火把和钥匙）
            renderItems(ctx);
            
            // 渲染玩家
            renderPlayer(ctx);
            
            // 渲染门位置（保持原有样式）
            if (gameState.door) {
                // 门的边框（深色）
                ctx.fillStyle = COLORS.DOOR;
                ctx.fillRect(
                    gameState.door.x * CONFIG.TILE_SIZE,
                    gameState.door.y * CONFIG.TILE_SIZE,
                    CONFIG.TILE_SIZE,
                    CONFIG.TILE_SIZE
                );
                
                // 门的内部（浅色）
                ctx.fillStyle = COLORS.DOOR_INTERNAL;
                ctx.fillRect(
                    gameState.door.x * CONFIG.TILE_SIZE + 2,
                    gameState.door.y * CONFIG.TILE_SIZE + 2,
                    CONFIG.TILE_SIZE - 4,
                    CONFIG.TILE_SIZE - 4
                );
                
                // 门把手（金色）
                ctx.fillStyle = COLORS.DOOR_HANDLE;
                ctx.beginPath();
                ctx.arc(
                    gameState.door.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE - 8,
                    gameState.door.y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                    3, 0, Math.PI * 2
                );
                ctx.fill();
            }
            
            // 添加提示信息
            ctx.fillStyle = COLORS.TEXT_COLOR;
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('按任意键或点击鼠标继续', canvas.width / 2, canvas.height - 20);
            
            return;
        }
        
        // 清空画布为黑色
        ctx.fillStyle = COLORS.BACKGROUND_BLACK;
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
    ctx.fillStyle = COLORS.BACKGROUND_BLACK;
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
        gradient.addColorStop(0, COLORS.MASK_CENTER); // 中心不遮罩
        gradient.addColorStop(0.6, COLORS.MASK_MIDDLE); // 部分遮罩
        gradient.addColorStop(1, COLORS.MASK_OUTER); // 完全遮罩
        
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
export { stopGameLoop, showCustomDialog };

// 自定义对话框管理
let dialogResolve = null;

// 初始化自定义对话框
function initCustomDialog() {
    const dialog = document.getElementById('custom-dialog');
    const dialogContent = document.getElementById('dialog-content');
    const dialogHeader = document.getElementById('dialog-header');
    const dialogTitle = document.getElementById('dialog-title');
    const dialogMessage = document.getElementById('dialog-message');
    const dialogConfirm = document.getElementById('dialog-confirm');
    const dialogCancel = document.getElementById('dialog-cancel');
    const dialogClose = document.getElementById('dialog-close');

    let isDragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    // 拖拽功能
    dialogHeader.addEventListener('mousedown', (e) => {
        // 阻止事件冒泡，防止对话框关闭
        e.stopPropagation();
        
        // 获取对话框内容的实际位置（相对于视口）
        const rect = dialogContent.getBoundingClientRect();
        
        // 计算鼠标相对于对话框内容左上角的偏移量
        dragOffsetX = e.clientX - rect.left;
        dragOffsetY = e.clientY - rect.top;
        
        // 保存当前位置和样式
        const originalPosition = dialogContent.style.position;
        const originalLeft = dialogContent.style.left;
        const originalTop = dialogContent.style.top;
        const originalTransform = dialogContent.style.transform;
        
        // 设置对话框内容为fixed定位，确保拖拽时位置正确
        dialogContent.style.position = 'fixed';
        dialogContent.style.left = rect.left + 'px';
        dialogContent.style.top = rect.top + 'px';
        dialogContent.style.transform = 'none';
        
        isDragging = true;
        dialogContent.style.cursor = 'grabbing';
    });
    
    // 为对话框标题栏添加其他事件监听器，阻止事件冒泡
    dialogHeader.addEventListener('mouseup', (e) => {
        e.stopPropagation();
    });
    
    dialogHeader.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            // 计算新位置
            const newX = e.clientX - dragOffsetX;
            const newY = e.clientY - dragOffsetY;
            
            // 直接设置位置，保持定位上下文一致
            dialogContent.style.left = newX + 'px';
            dialogContent.style.top = newY + 'px';
        }
    });
    
    // 为对话框内容添加多个事件监听器，阻止事件冒泡
    dialogContent.addEventListener('mousedown', (e) => {
        e.stopPropagation();
    });
    
    dialogContent.addEventListener('mouseup', (e) => {
        e.stopPropagation();
    });
    
    dialogContent.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        dialogContent.style.cursor = 'default';
    });

    // 确认按钮
    dialogConfirm.addEventListener('click', () => {
        hideDialog();
        if (dialogResolve) {
            dialogResolve(true);
            dialogResolve = null;
        }
    });

    // 取消按钮
    dialogCancel.addEventListener('click', () => {
        hideDialog();
        if (dialogResolve) {
            dialogResolve(false);
            dialogResolve = null;
        }
    });

    // 关闭按钮
    dialogClose.addEventListener('click', () => {
        hideDialog();
        if (dialogResolve) {
            dialogResolve(false);
            dialogResolve = null;
        }
    });
}

// 显示自定义对话框
function showCustomDialog(title, message, showCancel = true) {
    return new Promise((resolve) => {
        dialogResolve = resolve;
        
        const dialog = document.getElementById('custom-dialog');
        const dialogTitle = document.getElementById('dialog-title');
        const dialogMessage = document.getElementById('dialog-message');
        const dialogCancel = document.getElementById('dialog-cancel');
        
        dialogTitle.textContent = title;
        dialogMessage.textContent = message;
        dialogCancel.style.display = showCancel ? 'inline-block' : 'none';
        
        dialog.classList.remove('hidden');
        
        // 重置对话框位置到屏幕中心
        const dialogContent = document.getElementById('dialog-content');
        dialogContent.style.left = '50%';
        dialogContent.style.top = '50%';
        dialogContent.style.transform = 'translate(-50%, -50%)';
    });
}

// 隐藏对话框
function hideDialog() {
    const dialog = document.getElementById('custom-dialog');
    dialog.classList.add('hidden');
}

// 页面加载完成后初始化游戏
window.addEventListener('load', initGame);