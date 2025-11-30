import { defineComponent, ref, onMounted, onUnmounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterView, useRoute } from 'vue-router'

import ActionQueue from '@/components/ActionQueue'
import LeftSidebar from '@/components/LeftSidebar'

import InventoryPage from './InventoryPage'

export default defineComponent({
  name: 'GamePage',
  setup() {
    const { t } = useI18n()
    const route = useRoute()

    const tabsWidth = ref(360)
    const isDraggingTabs = ref(false)
    const parentElement = ref<HTMLElement | undefined>(undefined)
    const minTabsWidth = 280
    const maxTabsWidthPercentage = 0.5

    // 当前路由是否为 inventory 页面，若是则隐藏侧栏避免双重挂载
    const isInventoryRoute = computed(() => route.name === 'inventory')

    // 侧栏是否应该显示
    const shouldShowSidebar = computed(() => !isInventoryRoute.value)

    const containerStyle = computed(() => ({
      '--tabs-width': tabsWidth.value + 'px',
    }))

    // 根据侧栏可见性动态调整 grid 布局
    const gridClass = computed(() => {
      if (shouldShowSidebar.value) {
        return 'h-full grid grid-cols-[56px_minmax(0,1fr)] lg:grid-cols-[260px_minmax(0,1fr)_var(--tabs-width)] grid-rows-[auto_minmax(0,1fr)] gap-0.5'
      }
      // 不显示侧栏时，使用两列布局
      return 'h-full grid grid-cols-[56px_minmax(0,1fr)] lg:grid-cols-[260px_minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)] gap-0.5'
    })

    onMounted(() => {
      const container = document.getElementById('game-page-layout-container')
      if (container) {
        parentElement.value = container
      }
    })

    // 用于存储清理函数
    let cleanupDrag: (() => void) | null = null

    const startDragTabs = (e: MouseEvent) => {
      isDraggingTabs.value = true
      const startX = e.clientX
      const initialWidth = tabsWidth.value

      const dragTabs = (e: MouseEvent) => {
        if (!isDraggingTabs.value) return

        const deltaX = e.clientX - startX
        let newWidth = initialWidth - deltaX

        newWidth = Math.max(newWidth, minTabsWidth)

        if (parentElement.value && 'offsetWidth' in parentElement.value) {
          newWidth = Math.min(newWidth, parentElement.value.offsetWidth * maxTabsWidthPercentage)
        }

        tabsWidth.value = newWidth
      }

      const stopDragTabs = () => {
        isDraggingTabs.value = false
        document.removeEventListener('mousemove', dragTabs)
        document.removeEventListener('mouseup', stopDragTabs)
        document.body.classList.remove('dragging')
        cleanupDrag = null
      }

      // 保存清理函数
      cleanupDrag = stopDragTabs

      document.addEventListener('mousemove', dragTabs)
      document.addEventListener('mouseup', stopDragTabs)
      document.body.classList.add('dragging')
    }

    // 组件卸载时清理拖拽状态
    onUnmounted(() => {
      if (cleanupDrag) {
        cleanupDrag()
      }
    })

    return () => (
      <div class="h-full p-0.5 box-border relative">
        <div
          id="game-page-layout-container"
          class={gridClass.value}
          style={containerStyle.value}
        >
          <header class="col-span-full row-start-1 panel flex justify-between items-center px-8 py-4 lg:px-12">
            <div class="flex items-center gap-10">
              <h1 class="m-0 text-4xl font-bold tracking-wide text-gray-900 hidden lg:block">
                {t('gameName')}
              </h1>
              <ActionQueue />
            </div>
          </header>

          <div class="col-start-1 row-start-2 panel p-0.5">
            <LeftSidebar />
          </div>

          <div class="col-start-2 row-start-2 panel p-0 flex flex-col">
            <div class="flex-1 min-h-0 overflow-auto">
              <RouterView />
            </div>
          </div>

          {shouldShowSidebar.value && (
            <aside
              class="hidden lg:flex lg:col-start-3 lg:row-start-2 panel p-0 flex-row"
              style={{ width: `${tabsWidth.value}px` }}
            >
              <div
                class="w-2 cursor-ew-resize bg-gray-200 hover:bg-blue-200 flex items-center justify-center flex-shrink-0 transition"
                onMousedown={startDragTabs}
              >
                <div class="w-0.5 h-10 bg-gray-400 rounded transition" />
              </div>
              <div class="flex-1 flex flex-col overflow-hidden">
                <InventoryPage />
              </div>
            </aside>
          )}
        </div>

        <style>
          {`
            body.dragging {
              cursor: ew-resize !important;
              user-select: none !important;
            }
            body.dragging * {
              cursor: ew-resize !important;
            }
          `}
        </style>
      </div>
    )
  },
})
