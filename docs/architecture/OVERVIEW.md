# 技术栈与项目结构

## 1. 技术栈

本项目采用现代前端技术栈构建，主要包括：

- **框架**: [Vue 3](https://vuejs.org/) (使用 Composition API 和 `<script setup>`)
- **构建工具**: [Vite](https://vitejs.dev/)
- **语言**: [TypeScript](https://www.typescriptlang.org/)
- **状态管理**: [Pinia](https://pinia.vuejs.org/)
- **路由**: [Vue Router](https://router.vuejs.org/)
- **样式**: [UnoCSS](https://unocss.dev/) (原子化 CSS 引擎)
- **测试**: [Vitest](https://vitest.dev/) (单元测试和组件测试)
- **国际化**: [Vue I18n](https://kazupon.github.io/vue-i18n/)

## 2. 目录结构

```
frontend/
├── src/
│   ├── components/     # UI 组件
│   │   ├── modals/     # 模态框组件
│   │   └── ...         # 通用组件
│   ├── data/           # 游戏静态数据 (JSON)
│   │   ├── action/     # 动作配置 (采集等)
│   │   ├── item/       # 物品配置
│   │   └── ...         # 其他配置 (敌人, 技能等)
│   ├── gameConfig/     # 游戏配置加载与类型定义
│   ├── i18n/           # 国际化资源
│   ├── pages/          # 页面视图 (路由组件)
│   ├── stores/         # Pinia 状态管理
│   ├── utils/          # 工具函数 (数学, 格式化, 战斗模拟等)
│   ├── App.tsx         # 根组件
│   ├── main.ts         # 入口文件
│   └── router.ts       # 路由配置
└── ...
```
