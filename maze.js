// 迷宫生成和渲染模块
import { CONFIG, COLORS, DIFFICULTY_CONFIG } from './config.js';
import { gameState } from './state.js';

/**
 * 生成随机迷宫（使用递归回溯算法生成完美迷宫，然后随机移除墙壁形成回路）
 * @returns {number[][]} 生成的迷宫数组，0表示通路，1表示墙壁
 */
export function generateMaze() {
    // 初始化迷宫，所有格子都是墙壁
    const maze = Array(CONFIG.MAZE_HEIGHT).fill().map(() => 
        Array(CONFIG.MAZE_WIDTH).fill(1)
    );
    
    // 第一步：使用递归回溯算法生成完美迷宫（所有通道都是单路径，没有环路）
    function generatePerfectMaze(x, y) {
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
            // 由于移动步长是2个格子，需要确保目标位置在有效范围内
            if (nx > 0 && nx < CONFIG.MAZE_WIDTH - 1 && ny > 0 && ny < CONFIG.MAZE_HEIGHT - 1 && maze[ny][nx] === 1) {
                // 打通当前格子到目标格子的墙壁
                maze[y + dir.dy / 2][x + dir.dx / 2] = 0;
                // 递归访问目标格子
                generatePerfectMaze(nx, ny);
            }
        }
    }
    
    // 从(1,1)开始生成完美迷宫（奇数坐标确保边界）
    generatePerfectMaze(1, 1);
    
    // 第二步：随机移除部分墙壁，形成回路
    function createLoops() {
        // 收集所有可能的墙壁位置（这些墙壁连接两个通道）
        const potentialWalls = [];
        
        // 遍历所有内部墙壁（不包括边界）
        for (let y = 1; y < CONFIG.MAZE_HEIGHT - 1; y++) {
            for (let x = 1; x < CONFIG.MAZE_WIDTH - 1; x++) {
                // 如果当前位置是墙
                if (maze[y][x] === 1) {
                    // 检查这个墙是否连接两个通道
                    let connectsPaths = false;
                    
                    // 检查水平方向的墙（连接左右通道）
                    if (x > 0 && x < CONFIG.MAZE_WIDTH - 1 && 
                        maze[y][x-1] === 0 && maze[y][x+1] === 0) {
                        connectsPaths = true;
                    }
                    
                    // 检查垂直方向的墙（连接上下通道）
                    if (y > 0 && y < CONFIG.MAZE_HEIGHT - 1 && 
                        maze[y-1][x] === 0 && maze[y+1][x] === 0) {
                        connectsPaths = true;
                    }
                    
                    if (connectsPaths) {
                        potentialWalls.push({ x, y });
                    }
                }
            }
        }
        
        // 根据难度确定要移除的墙壁数量
        let wallRemovalRate = CONFIG.LOOP_GENERATION_RATE; // 使用默认值
        if (CONFIG.DIFFICULTY && DIFFICULTY_CONFIG[CONFIG.DIFFICULTY]) {
            // 使用当前难度的配置值
            wallRemovalRate = DIFFICULTY_CONFIG[CONFIG.DIFFICULTY].loopGenerationRate;
        }
        // 如果是自定义难度，会在其他地方设置CONFIG.LOOP_GENERATION_RATE
        
        // 计算要移除的墙壁数量
        const wallsToRemove = Math.floor(potentialWalls.length * wallRemovalRate);
        
        // 随机打乱墙壁数组
        for (let i = potentialWalls.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [potentialWalls[i], potentialWalls[j]] = [potentialWalls[j], potentialWalls[i]];
        }
        
        // 移除选定的墙壁，形成回路
        for (let i = 0; i < wallsToRemove && i < potentialWalls.length; i++) {
            const wall = potentialWalls[i];
            maze[wall.y][wall.x] = 0; // 打通墙壁
        }
    }
    
    // 创建回路
    createLoops();
    
    // 确保迷宫边界都是墙壁
    for (let x = 0; x < CONFIG.MAZE_WIDTH; x++) {
        maze[0][x] = 1; // 上边界
        maze[CONFIG.MAZE_HEIGHT - 1][x] = 1; // 下边界
    }
    for (let y = 0; y < CONFIG.MAZE_HEIGHT; y++) {
        maze[y][0] = 1; // 左边界
        maze[y][CONFIG.MAZE_WIDTH - 1] = 1; // 右边界
    }
    
    // 设置玩家初始位置（在通道中心）
    gameState.player.x = CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2; // 60
    gameState.player.y = CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2; // 60
    
    // 设置迷宫
    gameState.maze = maze;
    
    // 确保玩家初始位置在通路上
    gameState.maze[Math.floor(gameState.player.y / CONFIG.TILE_SIZE)][Math.floor(gameState.player.x / CONFIG.TILE_SIZE)] = 0;
    
    // 确保玩家初始位置有效
    console.log("玩家初始位置:", gameState.player.x, gameState.player.y);
    console.log("迷宫生成完成，使用递归回溯+随机移墙方法");
}

/**
 * 渲染迷宫
 * @param {CanvasRenderingContext2D} ctx - 画布上下文
 */
export function renderMaze(ctx) {
    for (let y = 0; y < CONFIG.MAZE_HEIGHT; y++) {
        for (let x = 0; x < CONFIG.MAZE_WIDTH; x++) {
            if (gameState.maze[y][x] === 1) {
                // 渲染墙壁
                ctx.fillStyle = COLORS.WALL;
                
                // 检查是否是最外层墙壁
                const isTopWall = y === 0;
                const isBottomWall = y === CONFIG.MAZE_HEIGHT - 1;
                const isLeftWall = x === 0;
                const isRightWall = x === CONFIG.MAZE_WIDTH - 1;
                const isSecondRightWall = x === CONFIG.MAZE_WIDTH - 2;
                
                // 最外层墙壁处理
                if (isRightWall || isLeftWall || isTopWall || isBottomWall) {
                    // 所有最外层墙壁，只绘制填充，不绘制边框，确保厚度为1像素
                    ctx.fillRect(x * CONFIG.TILE_SIZE, y * CONFIG.TILE_SIZE, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
                } else {
                    // 内部墙壁，绘制完整填充和边框
                    ctx.fillRect(x * CONFIG.TILE_SIZE, y * CONFIG.TILE_SIZE, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
                    ctx.strokeStyle = COLORS.WALL_BORDER;
                    ctx.lineWidth = 1;
                    ctx.strokeRect(x * CONFIG.TILE_SIZE, y * CONFIG.TILE_SIZE, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
                }
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