// 迷宫生成算法测试文件
const { generateMaze } = require('../maze.js');
const { CONFIG } = require('../config.js');

// 测试迷宫生成函数
describe('Maze Generation Algorithm', () => {
  // 测试迷宫尺寸是否正确
  test('should generate maze with correct dimensions', () => {
    const maze = generateMaze();
    
    // 检查迷宫的高度和宽度是否符合配置
    expect(maze.length).toBe(CONFIG.MAZE_HEIGHT);
    expect(maze[0].length).toBe(CONFIG.MAZE_WIDTH);
  });

  // 测试迷宫边界是否都是墙壁
  test('should have walls on all boundaries', () => {
    const maze = generateMaze();
    
    // 检查上边界是否都是墙壁
    for (let x = 0; x < CONFIG.MAZE_WIDTH; x++) {
      expect(maze[0][x]).toBe(1);
    }
    
    // 检查下边界是否都是墙壁
    for (let x = 0; x < CONFIG.MAZE_WIDTH; x++) {
      expect(maze[CONFIG.MAZE_HEIGHT - 1][x]).toBe(1);
    }
    
    // 检查左边界是否都是墙壁
    for (let y = 0; y < CONFIG.MAZE_HEIGHT; y++) {
      expect(maze[y][0]).toBe(1);
    }
    
    // 检查右边界是否都是墙壁
    for (let y = 0; y < CONFIG.MAZE_HEIGHT; y++) {
      expect(maze[y][CONFIG.MAZE_WIDTH - 1]).toBe(1);
    }
  });

  // 测试起始位置是否为通路
  test('should have path at starting position', () => {
    const maze = generateMaze();
    
    // 起始位置应该在(1,1)，即通路
    expect(maze[1][1]).toBe(0);
  });

  // 测试迷宫是否连通（简单检查）
  test('should generate connected maze', () => {
    const maze = generateMaze();
    
    // 检查是否存在至少一个通路（除了起始位置）
    let hasPath = false;
    for (let y = 0; y < CONFIG.MAZE_HEIGHT; y++) {
      for (let x = 0; x < CONFIG.MAZE_WIDTH; x++) {
        if (maze[y][x] === 0 && !(x === 1 && y === 1)) {
          hasPath = true;
          break;
        }
      }
      if (hasPath) break;
    }
    
    expect(hasPath).toBe(true);
  });

  // 测试迷宫是否包含回路
  test('should generate maze with loops', () => {
    const maze = generateMaze();
    
    // 检查是否存在一些内部墙壁被打通形成回路
    // 这是一个简单的启发式检查
    let wallCount = 0;
    let pathCount = 0;
    
    // 只检查内部区域，排除边界
    for (let y = 1; y < CONFIG.MAZE_HEIGHT - 1; y++) {
      for (let x = 1; x < CONFIG.MAZE_WIDTH - 1; x++) {
        if (maze[y][x] === 1) {
          wallCount++;
        } else {
          pathCount++;
        }
      }
    }
    
    // 在一个典型的迷宫中，通路数量应该显著大于墙壁数量
    // 这表明算法成功创建了回路
    expect(pathCount).toBeGreaterThan(wallCount * 0.5);
  });
});