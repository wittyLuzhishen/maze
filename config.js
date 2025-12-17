// 颜色配置，避免硬编码
export const COLORS = {
    // 迷宫相关
    WALL: '#fff',
    WALL_BORDER: '#ddd',
    PATH: '#000',
    DOOR: '#8B4513',
    DOOR_DETAIL: '#654321',
    DOOR_HANDLE: '#FFD700',
    
    // 玩家相关
    PLAYER_BODY: '#4169E1',
    PLAYER_HEAD: '#FFDAB9',
    PLAYER_EYE: '#000',
    PLAYER_MOUTH: '#000',
    PLAYER_ARM: '#FFDAB9',
    PLAYER_LEG: '#2E4053',
    
    // 道具相关
    TORCH_HANDLE: '#8B4513',
    TORCH_HEAD: '#A0522D',
    TORCH_FLAME_OUTER: '#FFD700',
    TORCH_FLAME_MIDDLE: '#FF4500',
    TORCH_FLAME_INNER: '#FF8C00',
    
    KEY: '#FFD700',
    
    // 照明相关
    LIGHT_OUTER: 'rgba(255, 255, 255, 1)',
    LIGHT_MIDDLE: 'rgba(255, 255, 255, 0.5)',
    LIGHT_INNER: 'rgba(255, 255, 255, 0)'
};

// 枚举对象，避免硬编码
export const ENUMS = {
    // 移动方向键
    MOVEMENT_KEYS: {
        UP: ['w', 'arrowup'],
        DOWN: ['s', 'arrowdown'],
        LEFT: ['a', 'arrowleft'],
        RIGHT: ['d', 'arrowright']
    },
    // 游戏难度
    DIFFICULTY: {
        EASY: 1,
        MEDIUM: 2,
        HARD: 3,
        EXPERT: 4,
        NIGHTMARE: 5
    }
};

// 游戏配置
export const CONFIG = {
    TILE_SIZE: 40,
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    MAZE_WIDTH: 20,  // 迷宫宽度（格子数）
    MAZE_HEIGHT: 15, // 迷宫高度（格子数）
    PLAYER_SPEED: 4,
    PLAYER_SIZE: 39,  // 玩家尺寸（宽/高），通道宽度减1
    TORCH_LIGHT_RADIUS: 100, // 火把照明半径
    INITIAL_TORCHES: 1,      // 初始火把数量
    TORCH_BURN_TIME: 30,     // 每个火把的燃烧时间（秒）
    KEY_SPAWN_RATE: 0.02,     // 钥匙生成概率
    
    // 不同难度级别的火把数量配置，关卡越难火把越少
    TORCH_COUNT_BY_LEVEL: {
        1: 5,   // 第1关：5个火把
        2: 4,   // 第2关：4个火把
        3: 3,   // 第3关：3个火把
        4: 2,   // 第4关：2个火把
        5: 1    // 第5关：1个火把
    },
    
    // 默认火把数量，用于超过配置的关卡
    DEFAULT_TORCH_COUNT: 1
};