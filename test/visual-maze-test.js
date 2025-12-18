// 可视化迷宫测试脚本 - 独立版本
// 只使用核心功能，不依赖完整游戏环境
import { generateMaze } from '../maze.js';
import { CONFIG } from '../config.js';
import { gameState } from '../state.js';

// 辅助函数：添加消息到控制台
function appendToConsole(message, type = 'log') {
    const consoleElement = document.getElementById('console');
    if (!consoleElement) return;
    
    const line = document.createElement('div');
    line.textContent = message;
    
    switch(type) {
        case 'error':
            line.style.color = '#ff6b6b';
            break;
        case 'warn':
            line.style.color = '#ffd166';
            break;
        default:
            line.style.color = '#dcdcdc';
    }
    
    consoleElement.appendChild(line);
    consoleElement.scrollTop = consoleElement.scrollHeight;
}

// 自定义生成门的函数（避免依赖items.js的完整功能）
function generateDoor() {
    const maze = gameState.maze;
    const possibleDoorPositions = [];
    
    // 遍历迷宫，寻找可能的门位置
    for (let y = 1; y < CONFIG.MAZE_HEIGHT - 1; y++) {
        for (let x = 1; x < CONFIG.MAZE_WIDTH - 1; x++) {
            // 门必须在墙壁上
            if (maze[y][x] === 1) {
                // 检查门是否连接两个通道
                const isHorizontalDoor = maze[y][x-1] === 0 && maze[y][x+1] === 0;
                const isVerticalDoor = maze[y-1][x] === 0 && maze[y+1][x] === 0;
                
                if (isHorizontalDoor || isVerticalDoor) {
                    possibleDoorPositions.push({ x, y });
                }
            }
        }
    }
    
    // 如果没有找到合适的位置，就在右上角生成一个门
    if (possibleDoorPositions.length === 0) {
        gameState.door = {
            x: CONFIG.MAZE_WIDTH - 2,
            y: 1
        };
    } else {
        // 从可能的位置中随机选择一个
        const randomIndex = Math.floor(Math.random() * possibleDoorPositions.length);
        gameState.door = possibleDoorPositions[randomIndex];
    }
    
    // 门的位置设为通路
    gameState.maze[gameState.door.y][gameState.door.x] = 0;
    
    console.log(`门位置设置在: (${gameState.door.x}, ${gameState.door.y})`);
}

// 辅助函数：验证迷宫的正确性
function validateMaze(maze) {
    console.log('\n=== 开始验证迷宫 ===');
    let isValid = true;
    
    // 验证1：检查边界完整性
    console.log('1. 验证边界完整性...');
    const rows = maze.length;
    const cols = maze[0].length;
    
    // 检查上边界
    for (let x = 0; x < cols; x++) {
        if (maze[0][x] !== 1) {
            console.error(`上边界第${x}列不是墙壁！`);
            isValid = false;
        }
    }
    
    // 检查下边界
    for (let x = 0; x < cols; x++) {
        if (maze[rows-1][x] !== 1) {
            console.error(`下边界第${x}列不是墙壁！`);
            isValid = false;
        }
    }
    
    // 检查左边界
    for (let y = 0; y < rows; y++) {
        if (maze[y][0] !== 1) {
            console.error(`左边界第${y}行不是墙壁！`);
            isValid = false;
        }
    }
    
    // 检查右边界
    for (let y = 0; y < rows; y++) {
        if (maze[y][cols-1] !== 1) {
            console.error(`右边界第${y}行不是墙壁！`);
            isValid = false;
        }
    }
    
    // 验证2：检查起始点是否有效
    console.log('2. 验证起始点有效性...');
    const startX = 1;
    const startY = 1;
    
    if (maze[startY][startX] !== 0) {
        console.error(`起始点(${startX}, ${startY})不是通路！`);
        isValid = false;
    } else {
        console.log(`起始点(${startX}, ${startY})验证通过。`);
    }
    
    // 验证3：检查连通性（使用广度优先搜索）
    console.log('3. 验证迷宫连通性...');
    const visited = Array(rows).fill().map(() => Array(cols).fill(false));
    const queue = [];
    
    queue.push({x: startX, y: startY});
    visited[startY][startX] = true;
    
    let connectedPaths = 1;
    const directions = [
        { dx: 0, dy: -1 }, // 上
        { dx: 1, dy: 0 },  // 右
        { dx: 0, dy: 1 },  // 下
        { dx: -1, dy: 0 }  // 左
    ];
    
    while (queue.length > 0) {
        const current = queue.shift();
        
        for (const dir of directions) {
            const nx = current.x + dir.dx;
            const ny = current.y + dir.dy;
            
            if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && maze[ny][nx] === 0 && !visited[ny][nx]) {
                visited[ny][nx] = true;
                queue.push({x: nx, y: ny});
                connectedPaths++;
            }
        }
    }
    
    // 计算总通路数量
    let totalPaths = 0;
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (maze[y][x] === 0) {
                totalPaths++;
            }
        }
    }
    
    if (connectedPaths === totalPaths) {
        console.log(`连通性验证通过，所有${totalPaths}个通路都相互连通。`);
    } else {
        console.error(`连通性验证失败！找到${connectedPaths}个连通通路，但总共有${totalPaths}个通路。`);
        isValid = false;
    }
    
    // 验证4：统计墙壁和通路比例
    console.log('4. 统计迷宫数据...');
    const totalCells = rows * cols;
    const wallCount = totalCells - totalPaths;
    const wallRatio = ((wallCount / totalCells) * 100).toFixed(1);
    const pathRatio = ((totalPaths / totalCells) * 100).toFixed(1);
    
    console.log(`迷宫尺寸: ${cols} x ${rows} = ${totalCells}个格子`);
    console.log(`墙壁数量: ${wallCount} (${wallRatio}%)`);
    console.log(`通路数量: ${totalPaths} (${pathRatio}%)`);
    
    console.log(`\n=== 迷宫验证 ${isValid ? '通过' : '失败'} ===`);
    return isValid;
}

// 绘制迷宫到Canvas
function drawMaze() {
    const canvas = document.getElementById('mazeCanvas');
    if (!canvas) {
        console.error('Canvas元素不存在！');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    const maze = gameState.maze;
    
    if (!maze) {
        console.error('迷宫数据不存在！');
        return;
    }
    
    console.log('开始绘制迷宫到Canvas...');
    
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const rows = maze.length;
    const cols = maze[0].length;
    
    // 计算缩放因子，确保迷宫适应画布
    const mazeWidth = cols * CONFIG.TILE_SIZE;
    const mazeHeight = rows * CONFIG.TILE_SIZE;
    const scaleX = canvas.width / mazeWidth;
    const scaleY = canvas.height / mazeHeight;
    const scale = Math.min(scaleX, scaleY);
    
    // 计算居中位置
    const offsetX = (canvas.width - mazeWidth * scale) / 2;
    const offsetY = (canvas.height - mazeHeight * scale) / 2;
    
    // 应用变换
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);
    
    // 绘制迷宫
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (maze[y][x] === 1) {
                // 绘制墙壁
                ctx.fillStyle = '#000000';
                ctx.fillRect(x * CONFIG.TILE_SIZE, y * CONFIG.TILE_SIZE, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
            } else {
                // 绘制通路
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(x * CONFIG.TILE_SIZE, y * CONFIG.TILE_SIZE, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
                
                // 添加通路边框
                ctx.strokeStyle = '#dddddd';
                ctx.lineWidth = 0.5;
                ctx.strokeRect(x * CONFIG.TILE_SIZE, y * CONFIG.TILE_SIZE, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
            }
        }
    }
    
    // 绘制起始点 (1,1)
    const startX = 1;
    const startY = 1;
    ctx.fillStyle = '#00ff00';
    ctx.beginPath();
    ctx.arc(
        startX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
        startY * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
        CONFIG.TILE_SIZE / 4,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    // 绘制终点（如果有门的话）
    if (gameState.door) {
        const doorX = gameState.door.x;
        const doorY = gameState.door.y;
        
        // 确保门在通路上
        if (maze[doorY][doorX] === 0) {
            ctx.fillStyle = '#ff0000';
            ctx.beginPath();
            ctx.arc(
                doorX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                doorY * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                CONFIG.TILE_SIZE / 4,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
    }
    
    ctx.restore();
    
    console.log('迷宫绘制完成！');
}

// 运行可视化测试
function runVisualMazeTest() {
    console.log('=== 开始可视化迷宫测试 ===');
    console.log('使用实际的maze.js算法生成迷宫...');
    
    try {
        // 重置游戏状态
        gameState.maze = [];
        gameState.door = null;
        
        console.log('重置游戏状态完成');
        
        // 生成迷宫
        generateMaze();
        
        console.log('迷宫生成完成！');
        console.log(`迷宫尺寸: ${CONFIG.MAZE_WIDTH} x ${CONFIG.MAZE_HEIGHT}`);
        
        // 生成门
        generateDoor();
        
        console.log('门生成完成！');
        
        // 验证迷宫
        const isValid = validateMaze(gameState.maze);
        
        // 检查右侧边界（修复验证）
        checkRightBoundary();
        
        // 绘制迷宫
        drawMaze();
        
        console.log('\n=== 可视化测试完成 ===');
        console.log('请查看上方的迷宫可视化区域。');
        console.log('绿色点表示起始位置，红色点表示终点（门的位置）。');
        
        return isValid;
        
    } catch (error) {
        console.error('测试过程中发生错误:', error);
        console.error('错误详情:', error.stack);
        return false;
    }
}

// 检查右侧边界是否正确生成
function checkRightBoundary() {
    const maze = gameState.maze;
    const rows = maze.length;
    const cols = maze[0].length;
    
    console.log('\n=== 检查右侧边界 ===');
    console.log(`迷宫尺寸: ${cols} x ${rows}`);
    
    // 检查右侧倒数第二列(x = cols - 2)
    const rightColumn = cols - 2;
    console.log(`检查右侧倒数第二列 x=${rightColumn}:`);
    
    let isAllWalls = true;
    let pathCount = 0;
    let wallCount = 0;
    
    for (let y = 0; y < rows; y++) {
        const cell = maze[y][rightColumn];
        console.log(`  y=${y}: ${cell} (${cell === 1 ? '墙壁' : '通路'})`);
        if (cell === 0) {
            isAllWalls = false;
            pathCount++;
        } else {
            wallCount++;
        }
    }
    
    console.log(`右侧倒数第二列全是墙壁: ${isAllWalls}`);
    console.log(`右侧倒数第二列通路数量: ${pathCount}`);
    console.log(`右侧倒数第二列墙壁数量: ${wallCount}`);
    
    if (isAllWalls) {
        console.error('发现问题：右侧倒数第二列全是墙壁！');
        return false;
    } else {
        console.log('修复成功：右侧倒数第二列包含通路！');
        return true;
    }
}

// 导出测试函数，供index.html调用
window.runVisualMazeTest = runVisualMazeTest;