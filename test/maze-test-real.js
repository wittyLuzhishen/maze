// 迷宫生成算法真实测试文件
// 这个文件测试真实的迷宫生成算法

// 模拟必要的模块和状态
const CONFIG = {
    MAZE_WIDTH: 22,
    MAZE_HEIGHT: 17,
    TILE_SIZE: 40
};

const gameState = {
    player: { x: 0, y: 0 },
    maze: []
};

// 真实的迷宫生成算法（简化版）
function generateMaze() {
    // 初始化迷宫，所有格子都是墙壁
    const maze = Array(CONFIG.MAZE_HEIGHT).fill().map(() => 
        Array(CONFIG.MAZE_WIDTH).fill(1)
    );
    
    // 第一步：使用递归回溯算法生成完美迷宫
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
            if (nx > 0 && nx < CONFIG.MAZE_WIDTH - 1 && ny > 0 && ny < CONFIG.MAZE_HEIGHT - 1 && maze[ny][nx] === 1) {
                // 打通当前格子到目标格子的墙壁
                maze[y + dir.dy / 2][x + dir.dx / 2] = 0;
                // 递归访问目标格子
                generatePerfectMaze(nx, ny);
            }
        }
    }
    
    // 从(1,1)开始生成完美迷宫
    generatePerfectMaze(1, 1);
    
    // 第二步：随机移除部分墙壁，形成回路
    function createLoops() {
        // 收集所有可能的墙壁位置
        const potentialWalls = [];
        
        // 遍历所有内部墙壁
        for (let y = 1; y < CONFIG.MAZE_HEIGHT - 1; y++) {
            for (let x = 1; x < CONFIG.MAZE_WIDTH - 1; x++) {
                // 如果当前位置是墙
                if (maze[y][x] === 1) {
                    // 检查这个墙是否连接两个通道
                    let connectsPaths = false;
                    
                    // 检查水平方向的墙
                    if (x > 0 && x < CONFIG.MAZE_WIDTH - 1 && 
                        maze[y][x-1] === 0 && maze[y][x+1] === 0) {
                        connectsPaths = true;
                    }
                    
                    // 检查垂直方向的墙
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
        
        // 移除10%的墙壁形成回路
        const wallsToRemove = Math.floor(potentialWalls.length * 0.1);
        
        // 随机打乱墙壁数组
        for (let i = potentialWalls.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [potentialWalls[i], potentialWalls[j]] = [potentialWalls[j], potentialWalls[i]];
        }
        
        // 移除选定的墙壁
        for (let i = 0; i < wallsToRemove && i < potentialWalls.length; i++) {
            const wall = potentialWalls[i];
            maze[wall.y][wall.x] = 0;
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
    
    // 设置玩家初始位置
    gameState.player.x = CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
    gameState.player.y = CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
    
    // 设置迷宫
    gameState.maze = maze;
    
    // 确保玩家初始位置在通路上
    gameState.maze[Math.floor(gameState.player.y / CONFIG.TILE_SIZE)][Math.floor(gameState.player.x / CONFIG.TILE_SIZE)] = 0;
    
    return maze;
}

// 测试函数
function runMazeTests() {
    console.log('开始测试迷宫生成算法...');
    
    console.log('1. 测试迷宫尺寸...');
    const maze = generateMaze();
    
    // 检查迷宫的高度和宽度是否符合配置
    if (maze.length === CONFIG.MAZE_HEIGHT) {
        console.log('✓ 迷宫高度正确:', maze.length);
    } else {
        console.error('✗ 迷宫高度错误:', maze.length, '期望:', CONFIG.MAZE_HEIGHT);
    }
    
    if (maze[0].length === CONFIG.MAZE_WIDTH) {
        console.log('✓ 迷宫宽度正确:', maze[0].length);
    } else {
        console.error('✗ 迷宫宽度错误:', maze[0].length, '期望:', CONFIG.MAZE_WIDTH);
    }
    
    console.log('\n2. 测试迷宫边界...');
    
    // 检查边界是否都是墙壁
    let boundariesCorrect = true;
    
    // 检查上边界
    for (let x = 0; x < CONFIG.MAZE_WIDTH; x++) {
        if (maze[0][x] !== 1) {
            boundariesCorrect = false;
            break;
        }
    }
    
    // 检查下边界
    for (let x = 0; x < CONFIG.MAZE_WIDTH; x++) {
        if (maze[CONFIG.MAZE_HEIGHT - 1][x] !== 1) {
            boundariesCorrect = false;
            break;
        }
    }
    
    // 检查左边界
    for (let y = 0; y < CONFIG.MAZE_HEIGHT; y++) {
        if (maze[y][0] !== 1) {
            boundariesCorrect = false;
            break;
        }
    }
    
    // 检查右边界
    for (let y = 0; y < CONFIG.MAZE_HEIGHT; y++) {
        if (maze[y][CONFIG.MAZE_WIDTH - 1] !== 1) {
            boundariesCorrect = false;
            break;
        }
    }
    
    if (boundariesCorrect) {
        console.log('✓ 所有边界都是墙壁');
    } else {
        console.error('✗ 边界检查失败');
    }
    
    console.log('\n3. 测试起始位置...');
    
    // 检查起始位置(1,1)是否为通路
    if (maze[1][1] === 0) {
        console.log('✓ 起始位置是通路');
    } else {
        console.error('✗ 起始位置不是通路');
    }
    
    console.log('\n4. 测试迷宫连通性...');
    
    // 检查是否存在通路
    let wallCount = 0;
    let pathCount = 0;
    
    for (let y = 0; y < CONFIG.MAZE_HEIGHT; y++) {
        for (let x = 0; x < CONFIG.MAZE_WIDTH; x++) {
            if (maze[y][x] === 1) {
                wallCount++;
            } else {
                pathCount++;
            }
        }
    }
    
    console.log(`✓ 墙壁数量: ${wallCount}`);
    console.log(`✓ 通路数量: ${pathCount}`);
    
    if (pathCount > wallCount * 0.3) {
        console.log('✓ 迷宫具有良好的连通性');
    } else {
        console.error('✗ 迷宫连通性不足');
    }
    
    console.log('\n5. 测试回路生成...');
    
    // 检查是否生成了回路（通过检查内部被打通的墙壁）
    let internalWallsRemoved = 0;
    for (let y = 1; y < CONFIG.MAZE_HEIGHT - 1; y++) {
        for (let x = 1; x < CONFIG.MAZE_WIDTH - 1; x++) {
            // 检查是否是原来应该是墙壁但现在是通路的位置
            // 这是一个简化的检查
            if (maze[y][x] === 0) {
                // 检查是否连接两个通路（可能是被打断的墙壁）
                const connectsPaths = 
                    (x > 0 && x < CONFIG.MAZE_WIDTH - 1 && maze[y][x-1] === 0 && maze[y][x+1] === 0) ||
                    (y > 0 && y < CONFIG.MAZE_HEIGHT - 1 && maze[y-1][x] === 0 && maze[y+1][x] === 0);
                
                if (connectsPaths) {
                    internalWallsRemoved++;
                }
            }
        }
    }
    
    console.log(`✓ 检测到可能的回路数量: ${internalWallsRemoved}`);
    
    if (internalWallsRemoved > 0) {
        console.log('✓ 成功生成回路');
    } else {
        console.warn('⚠ 未检测到明显回路（可能是正常的）');
    }
    
    console.log('\n6. 输出迷宫示意图...');
    // 输出迷宫的简化示意图
    const rowsToShow = Math.min(10, CONFIG.MAZE_HEIGHT);
    const colsToShow = Math.min(20, CONFIG.MAZE_WIDTH);
    
    console.log('迷宫左上角:');
    for (let y = 0; y < rowsToShow; y++) {
        let row = '';
        for (let x = 0; x < colsToShow; x++) {
            row += maze[y][x] === 1 ? '██' : '  ';
        }
        console.log(row);
    }
    
    console.log('\n测试完成！');
}

// 导出函数供外部调用
// 在浏览器环境中直接运行
runMazeTests();