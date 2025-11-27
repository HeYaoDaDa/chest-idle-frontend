# 数据模型设计文档

本项目使用 JSON 文件作为静态数据库，定义了游戏的所有基础元素。

## 1. 核心实体

### 1.1 技能 (Skill)
定义在 `src/data/skill.json`。
- **id**: 唯一标识符 (如 `mining`, `attack`)
- **name**: 显示名称 (i18n key)
- **description**: 描述
- **sort**: 排序权重

### 1.2 物品 (Item)
定义在 `src/data/item/` 目录下。
物品分为多个类别：
- **Resource**: 基础资源 (矿石, 木材)
- **Equipment**: 装备 (武器, 防具)
- **Consumable**: 消耗品 (药水, 食物)
- **Chest**: 宝箱 (可开启获得其他物品)

**通用属性**:
- `id`: 物品 ID
- `name`: 名称
- `category`: 分类
- `maxStack`: 最大堆叠数

**特定属性**:
- `chest`: 包含掉落表 (`loots`) 和最大点数。
- `equipment`: 包含装备槽位 (`slotId`) 和属性加成 (`effects`)。
- `consumable`: 包含持续时间 (`duration`) 和效果 (`effects`)。

### 1.3 动作 (Action)
定义在 `src/data/action/` 目录下。
描述玩家可以执行的挂机活动。
- **id**: 动作 ID
- **skillId**: 关联技能 ID
- **duration**: 基础耗时
- **xp**: 获得的经验值
- **chestPoints**: 获得的宝箱点数
- **input**: (可选) 消耗的物品
- **output**: (可选) 产出的物品

### 1.4 敌人 (Enemy)
定义在 `src/data/enemy.json`。
- **id**: 敌人 ID
- **hp**: 生命值
- **attack**: 攻击力
- **defense**: 防御力
- **fixedLootItems**: 固定掉落
- **fixedChestPoints**: 固定宝箱点数

## 2. 类型定义

核心类型定义位于 `src/gameConfig/type.ts`。

```typescript
// 示例类型结构
export interface GameConfig {
  type: 'skill' | 'slot' | 'stat' | 'item' | 'action' | 'enemy'
  id: string
  // ...
}
```

## 3. 数值模型 (FixedPoint)

为了支持大数值（放置类游戏常见需求），使用了 `FixedPoint` 类型。
在 JSON 配置中通常使用数字或字符串表示，但在加载到内存时会被转换为 `FixedPoint` 对象（通常是 BigInt 或特定结构的封装）。

## 4. 数据加载流程

1. `src/gameConfig/index.ts` 使用 `import.meta.glob` 扫描 `src/data` 目录。
2. 遍历所有 JSON 文件，根据 `type` 字段分类存储到对应的 Map 中 (e.g., `itemConfigMap`, `skillConfigMap`)。
3. 在加载过程中，会对部分数据进行预处理（如将数字转换为 FixedPoint）。
