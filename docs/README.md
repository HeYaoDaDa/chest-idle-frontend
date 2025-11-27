# Chest Idle 前端文档

欢迎阅读 Chest Idle 前端项目文档。本文档旨在帮助开发者理解项目的架构、设计和实现细节。

## 📚 目录

### 🏗️ 架构 (Architecture)
- [**概览 (Overview)**](./architecture/OVERVIEW.md): 技术栈、目录结构。
- [**核心概念 (Core Concepts)**](./architecture/CORE_CONCEPTS.md): 数据驱动、游戏循环、数值系统。

### 🎨 UI/UX 设计 (UI Design)
- [**布局 (Layouts)**](./ui/LAYOUTS.md): 全局布局（桌面/移动端）、页面特定布局。
- [**战斗页面布局 (Combat Layout)**](./ui/COMBAT_LAYOUT.md): CombatPage 结构、分区细节与交互流程。
- [**组件 (Components)**](./ui/COMPONENTS.md): 通用组件库文档 (ItemTag, ActionQueue, ModalBox 等)。

### ⚙️ 游戏系统 (Game Systems)
- [**数据模型 (Data Model)**](./systems/DATA_MODEL.md): JSON 数据结构定义 (Skill, Item, Enemy)。
- [**状态管理 (State Management)**](./systems/STATE_MANAGEMENT.md): Pinia Stores 详解。
- [**战斗系统 (Combat System)**](./systems/COMBAT.md): 战斗模拟、属性计算、伤害公式。

### ✅ 其他
- [**待办事项 (TODO)**](./TODO.md): 开发计划与任务清单。

## 🚀 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build
```
