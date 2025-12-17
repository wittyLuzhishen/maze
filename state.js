// 游戏状态管理
export let gameState = {
    isPlaying: false,
    hasStartedMoving: false,  // 玩家是否已经开始移动
    lastUpdateTime: 0,        // 上次更新的时间
    currentLevel: 1,         // 当前关卡
    startTime: 0,            // 关卡开始时间
    elapsedTime: 0,          // 当前关卡用时（秒）
    player: {
        x: 0,
        y: 0,
        torches: 1,           // 初始火把数量
        torchTime: 30,         // 初始火把时间
        hasKey: false
    },
    maze: [],
    torches: [],
    key: null,
    door: null
};

// 键盘控制状态
export let keysPressed = {};