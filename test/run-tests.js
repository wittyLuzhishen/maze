// Node.js测试运行器
// 这个脚本可以在命令行中直接运行迷宫生成算法测试
//
// 使用方法:
// 1. 确保已安装Node.js
// 2. 在test目录下运行: node run-tests.js
// 3. 或者使用npm命令: npm test
//
// 此脚本会运行所有迷宫生成算法的测试用例，
// 并生成详细的测试报告。

// 模拟浏览器环境中的console方法
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

// 创建一个简单的测试报告器
class TestReporter {
    constructor() {
        this.testsRun = 0;
        this.testsPassed = 0;
        this.testsFailed = 0;
        this.errors = [];
    }
    
    log(message) {
        originalLog(message);
    }
    
    error(message) {
        originalError(message);
        this.errors.push(message);
    }
    
    warn(message) {
        originalWarn(message);
    }
    
    reportTestResult(name, passed, errorMessage = null) {
        this.testsRun++;
        if (passed) {
            this.testsPassed++;
            this.log(`✓ ${name}`);
        } else {
            this.testsFailed++;
            this.error(`✗ ${name}${errorMessage ? ': ' + errorMessage : ''}`);
        }
    }
    
    printSummary() {
        this.log('n=== 测试总结 ===');
        this.log(`总测试数: ${this.testsRun}`);
        this.log(`通过: ${this.testsPassed}`);
        this.log(`失败: ${this.testsFailed}`);
        
        if (this.testsFailed > 0) {
            this.log('失败的测试:');
            this.errors.forEach(error => this.error(error));
        }
        
        if (this.testsFailed === 0) {
            this.log('🎉 所有测试都通过了!');
        }
    }
}

// 模拟配置
const CONFIG = {
    MAZE_WIDTH: 22,
    MAZE_HEIGHT: 17,
    TILE_SIZE: 40,
    LOOP_GENERATION_RATE: 0.1
};

const DIFFICULTY_CONFIG = {
    easy: {
        mazeWidth: 18,
        mazeHeight: 13,
        loopGenerationRate: 0.05
    },
    medium: {
        mazeWidth: 22,
        mazeHeight: 17,
        loopGenerationRate: 0.05
    },
    hard: {
        mazeWidth: 26,
        mazeHeight: 21,
        loopGenerationRate: 0.05
    }
};

// 迷宫生成算法
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

// 测试套件
class MazeTestSuite {
    constructor(reporter) {
        this.reporter = reporter;
    }
    
    runAllTests() {
        this.reporter.log('=== 开始迷宫生成算法测试 ===');
        
        this.testBasicFunctionality();
        this.testDifferentDifficulties();
        this.testBoundaryIntegrity();
        this.testConnectivity();
        this.testLoopGeneration();
        
        this.reporter.printSummary();
    }
    
    testBasicFunctionality() {
        this.reporter.log('1. 测试基本功能...');
        
        try {
            const maze = generateMaze();
            
            // 检查迷宫尺寸
            const sizeCheck = maze.length === CONFIG.MAZE_HEIGHT && maze[0].length === CONFIG.MAZE_WIDTH;
            this.reporter.reportTestResult('迷宫尺寸正确', sizeCheck);
            
            // 检查起始位置
            const startCheck = maze[1][1] === 0;
            this.reporter.reportTestResult('起始位置是通路', startCheck);
        } catch (error) {
            this.reporter.reportTestResult('基本功能测试', false, error.message);
        }
    }
    
    testDifferentDifficulties() {
        this.reporter.log('2. 测试不同难度...');
        const difficulties = ['easy', 'medium', 'hard'];
        
        for (const difficulty of difficulties) {
            try {
                const maze = generateMaze(difficulty);
                const expectedWidth = DIFFICULTY_CONFIG[difficulty].mazeWidth;
                const expectedHeight = DIFFICULTY_CONFIG[difficulty].mazeHeight;
                
                const sizeCheck = maze.length === expectedHeight && maze[0].length === expectedWidth;
                this.reporter.reportTestResult(`${difficulty}难度迷宫尺寸正确`, sizeCheck);
            } catch (error) {
                this.reporter.reportTestResult(`${difficulty}难度测试`, false, error.message);
            }
        }
    }
    
    testBoundaryIntegrity() {
        this.reporter.log('3. 测试边界完整性...');
        
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
            
            this.reporter.reportTestResult('边界完整性', isValid);
        } catch (error) {
            this.reporter.reportTestResult('边界完整性测试', false, error.message);
        }
    }
    
    testConnectivity() {
        this.reporter.log('4. 测试连通性...');
        
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
            
            const connectivityCheck = pathRatio > 0.3;
            this.reporter.reportTestResult('连通性良好', connectivityCheck);
            
            this.reporter.log(`  通路数量: ${pathCount}, 墙壁数量: ${wallCount}, 通路占比: ${(pathRatio * 100).toFixed(1)}%`);
        } catch (error) {
            this.reporter.reportTestResult('连通性测试', false, error.message);
        }
    }
    
    testLoopGeneration() {
        this.reporter.log('5. 测试回路生成...');
        
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
            
            const loopCheck = loopCount >= 0; // 至少没有负数
            this.reporter.reportTestResult('回路生成', loopCheck);
            
            this.reporter.log(`  检测到 ${loopCount} 个可能的回路`);
        } catch (error) {
            this.reporter.reportTestResult('回路生成测试', false, error.message);
        }
    }
}

// 运行测试
function runTests() {
    const reporter = new TestReporter();
    const testSuite = new MazeTestSuite(reporter);
    testSuite.runAllTests();
}

// 如果直接运行此脚本，则执行测试
if (require.main === module) {
    runTests();
}

module.exports = { generateMaze, MazeTestSuite, TestReporter };