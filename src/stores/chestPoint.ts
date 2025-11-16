import { defineStore } from 'pinia'
import { ref } from 'vue'

import { itemConfigMap } from '@/gameConfig'
import {
  type FixedPoint,
  toFixed,
  fromFixed,
  fpAdd,
  fpSub,
  fpDiv,
  fpFloor,
  fpMax,
  fpMod,
} from '@/utils/fixedPoint'

export const useChestPointStore = defineStore('chestPoint', () => {
  const chestPoints = ref<Record<string, FixedPoint>>(Object.create(null))

  function getChestPoints(chestId: string): FixedPoint {
    return chestPoints.value[chestId] ?? toFixed(0)
  }

  function setChestPoints(chestId: string, points: FixedPoint): void {
    chestPoints.value[chestId] = fpMax(toFixed(0), points)
  }

  function addChestPoints(chestId: string, points: FixedPoint): number {
    if (points <= 0) return 0
    const itemConfig = itemConfigMap[chestId]
    if (!itemConfig.chest) return 0
    const current = getChestPoints(chestId)
    const total = fpAdd(current, points)
    const count = Math.floor(fromFixed(fpFloor(fpDiv(total, itemConfig.chest.maxPoints))))
    const remainder = fpMod(total, itemConfig.chest.maxPoints)
    setChestPoints(chestId, remainder)
    return count
  }

  function getChestRemaining(chestId: string): FixedPoint {
    const itemConfig = itemConfigMap[chestId]
    if (!itemConfig.chest) return toFixed(0)
    return fpMax(toFixed(0), fpSub(itemConfig.chest.maxPoints, getChestPoints(chestId)))
  }

  function getChestProgress(chestId: string): number {
    const itemConfig = itemConfigMap[chestId]
    if (!itemConfig.chest) return 0
    const points = getChestPoints(chestId)
    return itemConfig.chest.maxPoints > 0 ? fromFixed(fpDiv(points, itemConfig.chest.maxPoints)) : 0
  }

  return {
    chestPoints,

    getChestPoints,
    setChestPoints,
    addChestPoints,
    getChestRemaining,
    getChestProgress,
  }
})
