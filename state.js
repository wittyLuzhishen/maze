// 游戏状态管理
import { CONFIG } from './config.js';

export let gameState = {
    isPlaying: false,
    isPaused: false,          // 游戏是否暂停
    hasStartedMoving: false,  // 玩家是否已经开始移动
    showFullMaze: false,      // 是否显示迷宫全貌
    lastUpdateTime: 0,        // 上次更新的时间
    currentLevel: 1,         // 当前关卡
    startTime: 0,            // 关卡开始时间
    moveStartTime: 0,        // 玩家开始移动的时间
    elapsedTime: 0,          // 当前关卡用时（秒）
    player: {
        x: 0,
        y: 0,
        torches: CONFIG.INITIAL_TORCHES,           // 初始火把数量
        torchTime: CONFIG.TORCH_BURN_TIME,         // 初始火把时间
        hasKey: false
    },
    maze: [],
    torches: [],
    key: null,
    door: null
};

// 键盘控制状态
export let keysPressed = {};