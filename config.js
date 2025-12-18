// 游戏配置文件
// 包含游戏中使用的所有常量、颜色、枚举和配置项

// 颜色配置，避免硬编码
// 集中管理所有颜色定义，便于统一修改和主题切换
export const COLORS = {
    // 迷宫相关颜色
    WALL: '#fff',              // 墙壁颜色
    WALL_BORDER: '#ddd',       // 墙壁边框颜色
    PATH: '#000',              // 通路颜色
    DOOR: '#8B4513',           // 门的主要颜色
    DOOR_DETAIL: '#654321',    // 门的细节颜色
    DOOR_HANDLE: '#FFD700',    // 门把手颜色
    DOOR_INTERNAL: '#DEB887',  // 门内部颜色
    
    // 玩家相关颜色
    PLAYER_BODY: '#4169E1',    // 玩家身体颜色
    PLAYER_HEAD: '#FFDAB9',    // 玩家头部肤色
    PLAYER_EYE: '#000',        // 眼睛颜色
    PLAYER_MOUTH: '#000',      // 嘴巴颜色
    PLAYER_ARM: '#FFDAB9',     // 手臂肤色
    PLAYER_LEG: '#2E4053',     // 腿部颜色
    PLAYER_HAIR: '#4a4a4a',    // 玩家头发颜色
    PLAYER_EYE_HIGHLIGHT: '#ffffff', // 玩家眼睛高光颜色
    PLAYER_MOUTH_LIPS: '#d2691e', // 玩家嘴唇颜色
    PLAYER_SHOE: '#333333',    // 玩家鞋子颜色
    
    // 道具相关颜色
    TORCH_HANDLE: '#8B4513',   // 火把柄颜色
    TORCH_HEAD: '#A0522D',     // 火把头部颜色
    TORCH_HEAD_UNLIT: '#696969', // 未点燃火把顶部颜色
    TORCH_FLAME_OUTER: '#FFD700', // 火焰外层颜色
    TORCH_FLAME_MIDDLE: '#FF4500', // 火焰中层颜色
    TORCH_FLAME_INNER: '#FF8C00', // 火焰内层颜色
    TORCH_WOOD_GRAIN: '#654321', // 火把木纹颜色
    TORCH_WRAP: '#8B4513',     // 火把缠绕物颜色
    TORCH_TEXTURE: '#4a4a4a',  // 火把纹理颜色
    TORCH_HIGHLIGHT: '#FFFFE0', // 火把高光颜色
    
    KEY: '#FFD700',            // 钥匙颜色
    KEY_HIGHLIGHT: '#FFFFE0',  // 钥匙高光颜色
    ITEM_SHADOW: 'rgba(0, 0, 0, 0.3)', // 道具阴影颜色
    
    // 照明相关颜色
    LIGHT_OUTER: 'rgba(255, 255, 255, 1)',   // 照明外层
    LIGHT_MIDDLE: 'rgba(255, 255, 255, 0.5)', // 照明中层
    LIGHT_INNER: 'rgba(255, 255, 255, 0)',   // 照明内层
    
    // 游戏渲染相关颜色
    BACKGROUND_WHITE: '#ffffff', // 白色背景
    BACKGROUND_BLACK: '#000000', // 黑色背景
    TEXT_COLOR: '#000000',      // 文本颜色
    
    // 遮罩渐变相关颜色
    MASK_CENTER: 'rgba(0, 0, 0, 0)',     // 遮罩中心透明
    MASK_MIDDLE: 'rgba(0, 0, 0, 0.5)',   // 遮罩中层半透明
    MASK_OUTER: 'rgba(0, 0, 0, 1)',      // 遮罩外层不透明
    
    // UI相关颜色
    UI_OVERLAY: 'rgba(0, 0, 0, 0.8)'     // UI遮罩层颜色
};

// 枚举对象，避免硬编码
// 提供游戏中的常量定义，便于代码维护和扩展
export const ENUMS = {
    // 移动方向键定义
    // 支持WASD和方向键两种控制方式
    MOVEMENT_KEYS: {
        UP: ['w', 'arrowup'],      // 向上移动
        DOWN: ['s', 'arrowdown'],  // 向下移动
        LEFT: ['a', 'arrowleft'],  // 向左移动
        RIGHT: ['d', 'arrowright'] // 向右移动
    },
    // 游戏难度枚举
    DIFFICULTY: {
        EASY: 1,      // 简单难度
        MEDIUM: 2,    // 中等难度
        HARD: 3,      // 困难难度
        EXPERT: 4,    // 专家难度
        NIGHTMARE: 5  // 噩梦难度
    },
    // 难度级别字符串枚举
    DIFFICULTY_LEVELS: {
        EASY: 'easy',     // 简单
        MEDIUM: 'medium', // 中等
        HARD: 'hard',     // 困难
        CUSTOM: 'custom'  // 自定义
    }
};

// 不同难度的游戏配置
// 根据难度级别设置不同的游戏参数，影响游戏体验
export const DIFFICULTY_CONFIG = {
    easy: {
        initialTorches: 3,     // 初始火把数量
        mazeTorches: 3,        // 迷宫中火把数量
        mazeWidth: 19,         // 迷宫宽度 - 改为奇数
        mazeHeight: 13,        // 迷宫高度
        torchLightRadius: 120, // 火把照明半径
        torchBurnTime: 20,      // 火把燃烧时间（秒）
        loopGenerationRate: 0.05 // 回路生成概率
    },
    medium: {
        initialTorches: 2,     // 初始火把数量
        mazeTorches: 5,        // 迷宫中火把数量
        mazeWidth: 23,         // 迷宫宽度 - 改为奇数
        mazeHeight: 17,        // 迷宫高度
        torchLightRadius: 100, // 火把照明半径
        torchBurnTime: 15,      // 火把燃烧时间（秒）
        loopGenerationRate: 0.05 // 回路生成概率
    },
    hard: {
        initialTorches: 1,     // 初始火把数量
        mazeTorches: 7,        // 迷宫中火把数量
        mazeWidth: 27,         // 迷宫宽度 - 改为奇数
        mazeHeight: 21,        // 迷宫高度
        torchLightRadius: 80,  // 火把照明半径
        torchBurnTime: 10,      // 火把燃烧时间（秒）
        loopGenerationRate: 0.05 // 回路生成概率
    }
};

// 游戏核心配置
// 定义游戏的基本参数和游戏规则
export const CONFIG = {
    TILE_SIZE: 40,           // 每个格子的像素大小
    CANVAS_WIDTH: 900,       // 画布宽度（像素）
    CANVAS_HEIGHT: 700,      // 画布高度（像素）
    MAZE_WIDTH: 23,          // 迷宫宽度（格子数） - 改为奇数，确保算法能访问到右侧倒数第二列
    MAZE_HEIGHT: 17,         // 迷宫高度（格子数）
    PLAYER_SPEED: 2.5,       // 玩家移动速度（像素/帧）
    PLAYER_SIZE: 25,         // 玩家尺寸（像素），小于通道宽度，确保角色在通道内
    TORCH_LIGHT_RADIUS: 100, // 火把照明半径（像素）
    INITIAL_TORCHES: 1,      // 初始火把数量
    TORCH_BURN_TIME: 15,     // 每个火把的燃烧时间（秒）
    KEY_SPAWN_RATE: 0.02,    // 钥匙生成概率（已废弃，改为固定生成）
    SCALE_FACTOR: 1,         // 画布缩放因子，用于大迷宫等比例缩小
    LOOP_GENERATION_RATE: 0.1, // 默认回路生成概率（10%）
    
    // 不同难度级别的火把数量配置，关卡越难火把越少
    // 随着关卡增加，迷宫中可收集的火把数量减少，增加游戏难度
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