/**
 * useAmountInput - Composable for amount input field management in Modals
 *
 * Provides common logic for:
 * - Amount string state management (text input value)
 * - Amount validation (integer or infinity check)
 * - Modal lifecycle (reset on close)
 *
 * Usage:
 * ```typescript
 * const {
 *   amountString,       // ref<string> - current input value
 *   allowAmount,        // computed<boolean> - is valid?
 *   resetAmount,        // () => void - reset to default
 * } = useAmountInput(defaultValue, customValidator)
 * ```
 */

import { computed, ref } from 'vue'

import { isIntegerOrInfinity } from '@/utils/amountParser'

interface UseAmountInputOptions {
  defaultValue?: string
  validator?: (value: string) => boolean
}

export function useAmountInput(options: UseAmountInputOptions = {}) {
  const { defaultValue = '∞', validator } = options

  const amountString = ref(defaultValue)

  /**
   * Validate amount input
   * - Default: checks if valid integer or infinity symbol
   * - Custom: uses provided validator function
   */
  const allowAmount = computed(() => {
    if (validator) {
      return validator(amountString.value)
    }
    return isIntegerOrInfinity(amountString.value)
  })

  /**
   * Reset amount to default value
   */
  const resetAmount = () => {
    amountString.value = defaultValue
  }

  return {
    amountString,
    allowAmount,
    resetAmount,
  }
}
