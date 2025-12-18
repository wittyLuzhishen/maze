// 测试迷宫边界生成的脚本
import { CONFIG } from '../config.js';
import { generateMaze } from '../maze.js';
import { gameState } from '../state.js';

// 测试迷宫生成并检查右侧边界
function testMazeBoundary() {
    console.log('测试迷宫生成的边界处理...');
    console.log('迷宫尺寸:', CONFIG.MAZE_WIDTH, 'x', CONFIG.MAZE_HEIGHT);
    
    // 生成迷宫
    generateMaze();
    
    const maze = gameState.maze;
    console.log('迷宫生成完成，开始检查右侧边界...');
    
    // 检查右侧倒数第二列(x = CONFIG.MAZE_WIDTH - 2)
    const rightColumn = CONFIG.MAZE_WIDTH - 2;
    console.log(`检查右侧倒数第二列 x=${rightColumn}:`);
    
    let isAllWalls = true;
    for (let y = 0; y < CONFIG.MAZE_HEIGHT; y++) {
        const cell = maze[y][rightColumn];
        console.log(`  y=${y}: ${cell} (${cell === 1 ? '墙壁' : '通路'})`);
        if (cell === 0) {
            isAllWalls = false;
        }
    }
    
    console.log(`右侧倒数第二列全是墙壁: ${isAllWalls}`);
    
    if (isAllWalls) {
        console.error('发现问题：右侧倒数第二列全是墙壁！');
        
        // 分析原因
        console.log('\n问题分析：');
        console.log('- 递归回溯算法的移动步长是2个格子');
        console.log('- 边界检查条件是 nx < CONFIG.MAZE_WIDTH - 1');
        console.log('- 最大的有效nx是 CONFIG.MAZE_WIDTH - 2 - 1 = CONFIG.MAZE_WIDTH - 3');
        console.log('- 当x达到 CONFIG.MAZE_WIDTH - 3 时，向右移动2个格子会超出边界');
        console.log('- 因此右侧倒数第二列永远不会被访问');
    } else {
        console.log('右侧倒数第二列生成正常，包含通路');
    }
    
    return isAllWalls;
}

// 导出测试函数
window.testMazeBoundary = testMazeBoundary;

// 立即运行测试
if (typeof window !== 'undefined') {
    window.onload = testMazeBoundary;
} else {
    testMazeBoundary();
}
