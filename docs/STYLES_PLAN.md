# 样式一致性与可访问性逐步改进计划（STYLES_PLAN)

本文档是基于对项目当前样式架构（UnoCSS）和组件/页面扫描的分析后，形成的逐步推进计划。目标：

- 统一按钮、卡片与交互类（UnoCSS shortcuts），并确保键盘/屏幕阅读器可用；
- 为动态显示（进度条、模态）添加语义与 ARIA；
- 逐页/逐组件、小范围 PR，包含测试与自动化检测（axe/Lighthouse）；

---

## 1. 总览

- 主样式系统：UnoCSS（`uno.config.ts`）
- 问题：大量 `div`/`span` 用作可交互元素且仅通过 `cursor-pointer`；缺少统一按钮快捷类；进度条和模态缺少 ARIA；少量 focus/focus-visible 样式。
- 目标：通过小步骤（每次 1 页或 1 组件）改进样式与可访问性，同时保持 UI 不变。

---

## 2. 已完成的基础更改（参考）

- 在 `uno.config.ts` 中新增 `btn`, `btn-secondary`, `interactive` shortcuts；为 `card-item` 添加 focus-visible ring。
- 将 `ModalBox` 增加 `role="dialog"` 与 `aria-modal="true"`，初步聚焦 modal 容器。
- 将 `ConsumableSlot`, `ChestPage`, `InventoryPage`, `SkillPage` 的卡片改成 `<button>`，并为进度条添加 `role="progressbar"` 和 `aria-valuenow`。
- 更新测试并运行 `npm run verify` 通过：315 个测试通过。

---

## 3. 阶段性推进计划（逐页/逐组件）

### 阶段 A — 关键页面（每页单独 PR）

1. ChestPage (PR A1)

   - 变更范围：`src/pages/ChestPage.tsx`
   - 变更内容： chest 卡片改为 `button`, 添加 `aria-label`；进度条 `role` + `aria-valuenow`。
   - 测试：断言 `button` 可点击、键盘触发、aria 进度条。

2. InventoryPage (PR A2)

   - 变更范围：`src/pages/InventoryPage.tsx`
   - 变更内容：inventory & equipment 可点击项改为 `button`, 添加 `aria-label`；空槽保持 `div`。
   - 测试：Tab 到按钮、Enter 激活、检查 `aria-label`。

3. SkillPage (PR A3)
   - 变更范围：`src/pages/SkillPage.tsx`, `src/components/ConsumableSlot.tsx`
   - 变更内容：action 卡改为 `button`；consumable slots 已替换为 `button`；加入进度条 aria。
   - 测试：action 卡键盘触发、进度条 aria 检查。

---

### 阶段 B — 组件级统一（小 PR）

1. LeftSidebar

   - 变更：`nav-link` 中添加 focus-visible；进度条腾出 aria 支持（已更新）。
   - 测试：Tab 顺序和类存在。

2. ActionQueue

   - 变更：progressbar 节点已有 aria（已补充）；将按钮类替换为 `btn` 或 `btn-secondary` 来统一视觉风格。
   - 测试：动作按钮依然工作、进度 aria 测试。

3. NotificationCenter
   - 变更：确保 dismiss/action 使用 `<button>`，并考虑 `aria-live="polite"` 或 `role="status"`。
   - 测试：消息可读性与 aria-live 的存在。

---

### 阶段 C — 自动化可访问性检查

- 集成 axe-core 检查（可选：`vitest-axe` 或 `jest-axe`）以自动扫描主要页面：`GamePage`, `InventoryPage`, `SkillPage`, `ChestPage`。
- 颜色对比测试：对 `text-gray-500`/`text-gray-600` 等文本运行对比检查（WCAG 4.5:1 规则）。
- CI 建议：添加 `npm run test:a11y` 或把 axe tests 放到 `npm run verify` 的 extended job。

---

### 阶段 D — 强化交互与 UX

- 聚焦锁（Focus Trap）: 在模态打开时 lock focus（例如 `focus-trap` 或自实现）。
- 无障碍替代：当必须使用非语义元素时，确保 `role=button`, `tabindex=0` 与键盘行为（Space/Enter）。
- 为切换按钮使用 `aria-pressed`, 为折叠区使用 `aria-controls` + `aria-expanded` 等。

---

## 4. PR & 测试要求（每个小 PR 必须包含）

- 职责范围：只修改与页面交互/样式相关的少量文件（最好 < 10）；
- 自动化：包含相关的 vitest 单元测试、`axe` 扫描（至少局部）
- 样式：若变更按钮样式，使用 `uno.config.ts` 中 `btn` 或 `btn-secondary`；注释/README 包含使用规则。
- 验证：能成功通过 `npm run verify`（type-check → tests → lint）

---

## 5. 示例 UnoCSS Shortcut（参考）

在 `uno.config.ts` 可加入：

```ts
shortcuts: {
  btn: 'px-4 py-2 rounded-md font-semibold transition inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-40',
  'btn-secondary': 'bg-gray-100 text-gray-900 border border-gray-300 hover:bg-gray-200',
  'card-item': 'rounded bg-white border border-gray-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
}
```

---

## 6. 常见变更检查清单（每个页面/组件适配）

- 交互元素：`div`/`span` -> `<button type="button">` 或保留 `role=button, tabindex=0` + 处理 onKeyDown。
- 进度条：`role=progressbar` + `aria-valuemin=0` + `aria-valuemax=100` + `aria-valuenow`。
- 对话框：`role=dialog` + `aria-modal=true`，打开时聚焦第一个元素。
- focus 可见性：`focus-visible:ring-2` 或 `outline-none` 结合 ring。
- 文本对比：核心操作文本保证对比足够（更改 `text-gray-600` -> `text-gray-700` 若需要）。

---

## 7. 验证命令（给开发者）

- 运行完整验证（type-check + tests + lint）：

```bash
npm run verify
```

- 运行单元测试：

```bash
npm test
```

- 运行开发服务：

```bash
npm run dev
```

---

## 8. 后续建议

- 使用 `vite` 的 `virtual:uno.css` 与 UnoCSS 的 `shortcuts` 维持一致视觉。将所有常用按钮替换为 `btn`/`btn-secondary` 以后会大大降低 UI 不一致风险。
- 考虑将常用交互模式（Card/Tile/Button）写入 `docs/STYLES.md`，成为团队约定。

---

> 这个计划文件是当前样式一致性与可访问性改进的操作手册；每次 PR 提交时，最好在 PR 描述中引用本文件中对应的检查点与测试用例以方便审查。
