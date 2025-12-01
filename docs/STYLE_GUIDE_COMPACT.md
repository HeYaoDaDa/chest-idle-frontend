# Compact UI Style Guide

目标：将项目的布局和组件样式统一为紧凑型（Compact）样式（作为默认样式），以便在同屏容纳更多信息，提高密度。

⚠️ 注意：紧凑化应以不影响可访问性为前提（例如——点击/触控目标不能过小）。任何压缩的 `padding` 或 `gap` 都需要权衡焦点环与触控目标。

## 变更概述

- 将 `btn`, `nav-link`, `card-item` 设置为紧凑默认样式，并新增 `divider` 和 `compact-base` utility（在 `uno.config.ts`）
- 所有 Modal 的 padding、间距及标题等级作紧凑化处理
- 优先更改列表/卡片/弹层/侧栏/按钮等高优先组件（ActionQueue、BattleEventLog、LeftSidebar、Modal 系）
- 保持 `rounded-lg` 以兼容现有测试断言，部分组件内部圆角已缩小为 `rounded-md`（更紧凑）

## UnoCSS 新增快捷方式

- 按钮、导航、卡片已默认使用紧凑规则（`btn`, `nav-link`, `card-item`）。可使用 `divider` 和 `compact-base` 作为布局工具。
- `divider`：1px 分隔线：`border-b border-neutral-100 last:border-b-0`。
- `compact-base`：将作为父容器类，用于将字体和行高调低、降低默认间距。
 - `compact-base`：在需要时可作为对齐辅助，但紧凑是默认风格，不再区分模式。

## 可复用规则（建议）

- 列表项与卡片项：
  - gap: `gap-2` 或更小（针对行内元素）
  - item padding: `p-2` 或 `p-1`（不要小于 8px 触控目标/可访问触发）
  - 关键分割使用 `divider`（避免使用过多 margin 来分隔）
- Modal：
  - header/body/footer 使用 `gap-2`、`py-1` 类
  - 主要按钮使用 `btn-primary`（大按钮），次要按钮使用 `btn-secondary`（紧凑为默认）
- 字体与排版：
  - `text-base` -> `text-sm`（在 `compact-base` 中）；`h2` 大小从 `text-2xl` -> `text-xl`

## 标准迁移步骤（PR 指南）

1. 优先处理端点组件（例如：Modal, List, Card, Sidebar）
2. 引入 `compact-base` 类到父容器（例如：列表/页面面板/卡片容器）
3. 将较大的 `gap`, `py`, `px` 减小：
   - 4/3 -> 2
   - 3/2.5 -> 2
   - 2/1.5 -> 1
4. 用 `divider` 替代 margin/padding 分隔（必要）
5. 保持可访问性：核查焦点环、可点击区域（至少 44x44 px 建议）
6. 更新组件单元测试，优先保持类名断言稳定，避免过分依赖特定圆角或 padding 等样式节点。

## 变更清单（已完成）

- `uno.config.ts`：将 `btn`, `nav-link`, `card-item` 默认设置为紧凑风格；新增 `divider`, `compact-base`。
- `src/components/ActionQueue.tsx`：gap、按钮和进度条高度、`compact-base`
- `src/components/BattleEventLog.tsx`：节点间距、事件项 padding、divider、timestamp 宽度
- `src/components/LeftSidebar.tsx`：移动端导航已使用紧凑 `nav-link`（现在为默认）
- `src/components/ModalBox.tsx`：减少 padding（`p-2`/`p-3`），保留 `rounded-lg` 以保证测试
- `src/components/modals/*`：所有 modals 均已根据紧凑规范调整（`ActionModalBox`, `ActionQueueModal`, `ChestModalBox`, `ChestResultsModal`, `ConsumableSelectModal`, `EnemyModalBox`, `ItemModal` 等）

## TODO（建议下一步）

- 批量替换更多组件（如 `LeftSidebar` 的 `nav-link` 案例扩散到所有项）
 - 未来如果需要，为用户提供 `紧凑/标准` 可视化切换，但当前默认仅保留紧凑样式
- 为所有页面做视觉回归测试，以确保不同屏幕下的可用性
- 文档中示例图和对比图片

---

💡 Tips: 在大型修改里，逐步提交小改动（每个 PR 覆盖一类组件），并在 PR 中包含运行截图或 Storybook 页面，便于视觉回顾。 
