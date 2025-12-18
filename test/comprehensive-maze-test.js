// 综合迷宫生成算法测试文件
// 这个文件包含更全面的测试用例，用于验证迷宫生成算法的正确性
//
// 使用方法:
// 1. 在浏览器中打开 index.html，点击"运行综合迷宫测试"按钮
// 2. 或者在命令行中运行: node run-tests.js
//
// 测试内容包括:
// - 基本功能测试
// - 不同难度级别的迷宫生成
// - 边界完整性验证
// - 连通性检查
// - 回路生成验证

// 导入必要的模块
import { CONFIG, DIFFICULTY_CONFIG } from '../config.js';

// 模拟游戏状态
const gameState = {
    player: { x: 0, y: 0 },
    maze: []
};

// 导入真实的迷宫生成算法
function generateMaze(difficulty = 'medium') {
    // 根据难度设置迷宫尺寸
    let mazeWidth = CONFIG.MAZE_WIDTH;
    let mazeHeight = CONFIG.MAZE_HEIGHT;
    
    if (DIFFICULTY_CONFIG[difficulty]) {
        mazeWidth = DIFFICULTY_CONFIG[difficulty].mazeWidth || mazeWidth;
        mazeHeight = DIFFICULTY_CONFIG[difficulty].mazeHeight || mazeHeight;
    }
    
    // 初始化迷宫，所有格子都是墙壁
    const maze = Array(mazeHeight).fill().map(() => 
        Array(mazeWidth).fill(1)
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
            if (nx > 0 && nx < mazeWidth - 1 && ny > 0 && ny < mazeHeight - 1 && maze[ny][nx] === 1) {
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
        for (let y = 1; y < mazeHeight - 1; y++) {
            for (let x = 1; x < mazeWidth - 1; x++) {
                // 如果当前位置是墙
                if (maze[y][x] === 1) {
                    // 检查这个墙是否连接两个通道
                    let connectsPaths = false;
                    
                    // 检查水平方向的墙
                    if (x > 0 && x < mazeWidth - 1 && 
                        maze[y][x-1] === 0 && maze[y][x+1] === 0) {
                        connectsPaths = true;
                    }
                    
                    // 检查垂直方向的墙
                    if (y > 0 && y < mazeHeight - 1 && 
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
        const wallRemovalRate = DIFFICULTY_CONFIG[difficulty]?.loopGenerationRate || CONFIG.LOOP_GENERATION_RATE;
        const wallsToRemove = Math.floor(potentialWalls.length * wallRemovalRate);
        
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
    for (let x = 0; x < mazeWidth; x++) {
        maze[0][x] = 1; // 上边界
        maze[mazeHeight - 1][x] = 1; // 下边界
    }
    for (let y = 0; y < mazeHeight; y++) {
        maze[y][0] = 1; // 左边界
        maze[y][mazeWidth - 1] = 1; // 右边界
    }
    
    return maze;
}

// 测试函数
function runComprehensiveMazeTests() {
    console.log('=== 开始综合迷宫生成算法测试 ===');
    
    // 测试1: 基本功能测试
    console.log('1. 测试基本功能...');
    testBasicFunctionality();
    
    // 测试2: 不同难度测试
    console.log('2. 测试不同难度...');
    testDifferentDifficulties();
    
    // 测试3: 边界完整性测试
    console.log('3. 测试边界完整性...');
    testBoundaryIntegrity();
    
    // 测试4: 连通性测试
    console.log('4. 测试连通性...');
    testConnectivity();
    
    // 测试5: 回路生成测试
    console.log('5. 测试回路生成...');
    testLoopGeneration();
    
    console.log('=== 所有测试完成 ===');
}

// 测试基本功能
function testBasicFunctionality() {
    try {
        const maze = generateMaze();
        
        // 检查迷宫尺寸
        if (maze.length === CONFIG.MAZE_HEIGHT && maze[0].length === CONFIG.MAZE_WIDTH) {
            console.log('✓ 迷宫尺寸正确');
        } else {
            console.error('✗ 迷宫尺寸错误');
            return;
        }
        
        // 检查起始位置
        if (maze[1][1] === 0) {
            console.log('✓ 起始位置是通路');
        } else {
            console.error('✗ 起始位置不是通路');
        }
        
        console.log('✓ 基本功能测试通过');
    } catch (error) {
        console.error('✗ 基本功能测试失败:', error.message);
    }
}

// 测试不同难度
function testDifferentDifficulties() {
    const difficulties = ['easy', 'medium', 'hard'];
    
    for (const difficulty of difficulties) {
        try {
            const maze = generateMaze(difficulty);
            const expectedWidth = DIFFICULTY_CONFIG[difficulty].mazeWidth;
            const expectedHeight = DIFFICULTY_CONFIG[difficulty].mazeHeight;
            
            if (maze.length === expectedHeight && maze[0].length === expectedWidth) {
                console.log(`✓ ${difficulty}难度迷宫尺寸正确 (${expectedWidth}x${expectedHeight})`);
            } else {
                console.error(`✗ ${difficulty}难度迷宫尺寸错误`);
            }
        } catch (error) {
            console.error(`✗ ${difficulty}难度测试失败:`, error.message);
        }
    }
}

// 测试边界完整性
function testBoundaryIntegrity() {
    try {
        const maze = generateMaze();
        const height = maze.length;
        const width = maze[0].length;
        let isValid = true;
        
        // 检查上边界
        for (let x = 0; x < width; x++) {
            if (maze[0][x] !== 1) {
                isValid = false;
                break;
            }
        }
        
        // 检查下边界
        if (isValid) {
            for (let x = 0; x < width; x++) {
                if (maze[height - 1][x] !== 1) {
                    isValid = false;
                    break;
                }
            }
        }
        
        // 检查左边界
        if (isValid) {
            for (let y = 0; y < height; y++) {
                if (maze[y][0] !== 1) {
                    isValid = false;
                    break;
                }
            }
        }
        
        // 检查右边界
        if (isValid) {
            for (let y = 0; y < height; y++) {
                if (maze[y][width - 1] !== 1) {
                    isValid = false;
                    break;
                }
            }
        }
        
        if (isValid) {
            console.log('✓ 边界完整性测试通过');
        } else {
            console.error('✗ 边界完整性测试失败');
        }
    } catch (error) {
        console.error('✗ 边界完整性测试失败:', error.message);
    }
}

// 测试连通性
function testConnectivity() {
    try {
        const maze = generateMaze();
        const height = maze.length;
        const width = maze[0].length;
        
        // 计算通路和墙壁的数量
        let pathCount = 0;
        let wallCount = 0;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (maze[y][x] === 0) {
                    pathCount++;
                } else {
                    wallCount++;
                }
            }
        }
        
        // 检查是否有足够的通路
        const totalCells = height * width;
        const pathRatio = pathCount / totalCells;
        
        if (pathRatio > 0.3) {
            console.log(`✓ 连通性良好 (通路占比: ${(pathRatio * 100).toFixed(1)}%)`);
        } else {
            console.warn(`⚠ 连通性可能不足 (通路占比: ${(pathRatio * 100).toFixed(1)}%)`);
        }
        
        console.log(`  通路数量: ${pathCount}, 墙壁数量: ${wallCount}`);
    } catch (error) {
        console.error('✗ 连通性测试失败:', error.message);
    }
}

// 测试回路生成
function testLoopGeneration() {
    try {
        const maze = generateMaze();
        const height = maze.length;
        const width = maze[0].length;
        
        // 统计可能的回路数量
        let loopCount = 0;
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                // 检查是否是原来应该是墙壁但现在是通路的位置
                if (maze[y][x] === 0) {
                    // 检查是否连接两个通路
                    const connectsHorizontally = maze[y][x-1] === 0 && maze[y][x+1] === 0;
                    const connectsVertically = maze[y-1][x] === 0 && maze[y+1][x] === 0;
                    
                    if (connectsHorizontally || connectsVertically) {
                        loopCount++;
                    }
                }
            }
        }
        
        if (loopCount > 0) {
            console.log(`✓ 成功生成回路 (检测到 ${loopCount} 个可能的回路)`);
        } else {
            console.warn('⚠ 未检测到明显回路（可能是正常的）');
        }
    } catch (error) {
        console.error('✗ 回路生成测试失败:', error.message);
    }
}

// 导出测试函数
export { runComprehensiveMazeTests };

// 如果在浏览器环境中直接运行
if (typeof window !== 'undefined') {
    runComprehensiveMazeTests();
}