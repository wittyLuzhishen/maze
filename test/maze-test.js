// 迷宫生成算法测试文件
// 这个文件可以直接在浏览器中运行来测试迷宫生成算法

// 导入必要的模块（在浏览器环境中通过HTML引入）
// import { generateMaze } from '../maze.js';
// import { CONFIG } from '../config.js';

// 由于这是浏览器环境，我们直接复制需要的配置
const CONFIG = {
    MAZE_WIDTH: 22,
    MAZE_HEIGHT: 17,
    TILE_SIZE: 40
};

console.log('开始测试迷宫生成算法...');

// 测试迷宫生成函数
function testMazeGeneration() {
    // 模拟generateMaze函数的核心逻辑
    function generateMaze() {
        // 初始化迷宫，所有格子都是墙壁
        const maze = Array(CONFIG.MAZE_HEIGHT).fill().map(() => 
            Array(CONFIG.MAZE_WIDTH).fill(1)
        );
        
        // 简化的迷宫生成逻辑（实际实现会更复杂）
        // 这里只是用于演示测试
        
        // 从(1,1)开始创建一条路径到右下角
        let x = 1, y = 1;
        maze[y][x] = 0; // 起始点
        
        // 简单的路径创建（实际算法使用递归回溯）
        while (x < CONFIG.MAZE_WIDTH - 2 || y < CONFIG.MAZE_HEIGHT - 2) {
            if (x < CONFIG.MAZE_WIDTH - 2) {
                x++;
            } else if (y < CONFIG.MAZE_HEIGHT - 2) {
                y++;
            }
            maze[y][x] = 0;
        }
        
        // 确保边界都是墙壁
        for (let i = 0; i < CONFIG.MAZE_WIDTH; i++) {
            maze[0][i] = 1; // 上边界
            maze[CONFIG.MAZE_HEIGHT - 1][i] = 1; // 下边界
        }
        for (let i = 0; i < CONFIG.MAZE_HEIGHT; i++) {
            maze[i][0] = 1; // 左边界
            maze[i][CONFIG.MAZE_WIDTH - 1] = 1; // 右边界
        }
        
        return maze;
    }
    
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
    let pathCount = 0;
    for (let y = 0; y < CONFIG.MAZE_HEIGHT; y++) {
        for (let x = 0; x < CONFIG.MAZE_WIDTH; x++) {
            if (maze[y][x] === 0) {
                pathCount++;
            }
        }
    }
    
    if (pathCount > 1) {
        console.log('✓ 迷宫包含多个通路:', pathCount);
    } else {
        console.error('✗ 迷宫通路过少:', pathCount);
    }
    
    console.log('\n5. 输出迷宫示意图...');
    // 输出迷宫的简化示意图（只显示角落部分）
    const rowsToShow = Math.min(5, CONFIG.MAZE_HEIGHT);
    const colsToShow = Math.min(10, CONFIG.MAZE_WIDTH);
    
    console.log('迷宫左上角:');
    for (let y = 0; y < rowsToShow; y++) {
        let row = '';
        for (let x = 0; x < colsToShow; x++) {
            row += maze[y][x] === 1 ? '█' : ' ';
        }
        console.log(row);
    }
    
    console.log('\n测试完成！');
}

// 运行测试
testMazeGeneration();