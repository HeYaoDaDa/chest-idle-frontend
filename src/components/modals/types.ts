/**
 * Modal Props Types - Unified type definitions for all Modal components
 *
 * All modals follow a common pattern:
 * - `show`: Boolean prop to control visibility (required)
 * - `emits['close']`: Event emitted when modal should close
 * - Additional props vary by modal type
 */

import type { PropType } from 'vue'

/**
 * Base modal props - required for all modals
 */
export interface BaseModalProps {
  show: boolean
}

/**
 * Action/Enemy/Chest display modal props (entity modal)
 * Used for modals displaying a single entity by ID
 */
export interface EntityModalProps extends BaseModalProps {
  show: boolean
  // entityId field name varies per modal (actionId, enemyId, chestId)
}

/**
 * Inventory item display modal props
 * Used for ItemModal
 */
export interface ItemModalProps extends BaseModalProps {
  itemId: string
  mode?: 'inventory' | 'equipped' | 'view'
}

/**
 * Results display modal props
 * Used for ChestResultsModal
 */
export interface ChestResultModalProps extends BaseModalProps {
  results: Array<{
    itemId: string
    amount: number
  }> | null
}

/**
 * Skill-specific modal props
 * Used for ConsumableSelectModal
 */
export interface SkillModalProps extends BaseModalProps {
  skillId: string
  slotIndex: number
}

/**
 * Vue PropType definitions for use in components
 * These define the common prop structures used by modals
 */
export const modalPropTypes = {
  /**
   * Base props for all modals
   */
  baseModal: {
    show: { type: Boolean, required: true },
  },

  /**
   * Props for entity display modals (ActionModalBox, EnemyModalBox, ChestModalBox)
   * Note: Each modal specifies its own entityId prop name (actionId, enemyId, chestId)
   */
  baseEntityModal: {
    show: { type: Boolean, required: true },
  },

/**
 * Props for item display modal (ItemModal)
 */
itemModal: {
  show: { type: Boolean, required: true },
  itemId: { type: String, required: true },
  mode: {
    type: String as PropType<'inventory' | 'equipped' | 'view'>,
    default: undefined,
  },
},  /**
   * Props for chest result display modal (ChestResultsModal)
   */
  chestResultModal: {
    show: { type: Boolean, required: true },
    results: {
      type: Array as PropType<Array<{ itemId: string; amount: number }> | null>,
      default: null,
    },
  },

  /**
   * Props for skill selection modal (ConsumableSelectModal)
   */
  skillModal: {
    show: { type: Boolean, required: true },
    skillId: { type: String, required: true },
    slotIndex: { type: Number, required: true },
  },
}
