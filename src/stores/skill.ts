import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { skillConfigMap, skillConfigs } from '@/gameConfig'
import i18n from '@/i18n'
import { type FixedPoint, toFixed, fpAdd, fpSub, fpMax } from '@/utils/fixedPoint'

import { useNotificationStore } from './notification'

export interface Skill {
  id: string
  name: string
  description: string
  sort: number
  xp: FixedPoint
  level: number
  remainingXpForUpgrade: FixedPoint
  upgradeProgress: number
}

export const useSkillStore = defineStore('skill', () => {
  const notificationStore = useNotificationStore()

  const skillXpMap = ref<Record<string, FixedPoint>>(Object.create(null))

  function getSkillXp(skillId: string): FixedPoint {
    return skillXpMap.value[skillId] ?? toFixed(0)
  }

  function getSkillLevel(skillId: string): number {
    return getLevelFromXp(getSkillXp(skillId))
  }

  function getRemainingXpForUpgrade(skillId: string): FixedPoint {
    const currentXp = getSkillXp(skillId)
    const currentLevel = getLevelFromXp(currentXp)
    const nextLevelXp = XP_TABLE[currentLevel + 1] ?? (Infinity as unknown as FixedPoint)
    return fpMax(toFixed(0), fpSub(nextLevelXp, currentXp))
  }

  function getUpgradeProgress(skillId: string): number {
    const currentXp = getSkillXp(skillId)
    const currentLevel = getLevelFromXp(currentXp)
    const currentLevelXp = XP_TABLE[currentLevel] ?? toFixed(0)
    const nextLevelXp = XP_TABLE[currentLevel + 1] ?? (Infinity as unknown as FixedPoint)

    if (nextLevelXp === (Infinity as unknown as number)) return 1

    return (currentXp - currentLevelXp) / (nextLevelXp - currentLevelXp)
  }

  function addSkillXp(skillId: string, xp: FixedPoint): void {
    const previousLevel = getLevelFromXp(getSkillXp(skillId))
    const newXp = fpAdd(getSkillXp(skillId), xp)
    skillXpMap.value[skillId] = newXp
    const currentLevel = getLevelFromXp(newXp)

    if (currentLevel > previousLevel) {
      const skillConfig = skillConfigMap[skillId]
      if (skillConfig) {
        notificationStore.info('notification.levelUp', {
          skill: i18n.global.t(skillConfig.name),
          level: currentLevel,
        })
      }
    }
  }

  function getSkill(skillId: string): Skill | undefined {
    const skillConfig = skillConfigMap[skillId]
    if (!skillConfig) return undefined

    return {
      ...skillConfig,
      xp: getSkillXp(skillId),
      level: getSkillLevel(skillId),
      remainingXpForUpgrade: getRemainingXpForUpgrade(skillId),
      upgradeProgress: getUpgradeProgress(skillId),
    }
  }

  const skillList = computed(() => {
    return Array.from(skillConfigs)
      .map((config) => getSkill(config.id))
      .filter((skill): skill is NonNullable<typeof skill> => skill !== undefined)
      .sort((a, b) => a.sort - b.sort)
  })

  return {
    skillXpMap,

    skillList,

    getSkill,
    getSkillLevel,
    addSkillXp,
  }
})

function getLevelFromXp(xp: FixedPoint): number {
  let left = 0
  let right = XP_TABLE.length - 1
  let result = 0
  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    if (XP_TABLE[mid] <= xp) {
      result = mid
      left = mid + 1
    } else {
      right = mid - 1
    }
  }
  return result
}

const XP_TABLE: readonly FixedPoint[] = [
  0, 33, 76, 132, 202, 286, 386, 503, 637, 791, 964, 1159, 1377, 1620, 1891, 2192, 2525, 2893, 3300,
  3750, 4247, 4795, 5400, 6068, 6805, 7618, 8517, 9508, 10604, 11814, 13151, 14629, 16262, 18068,
  20064, 22271, 24712, 27411, 30396, 33697, 37346, 41381, 45842, 50773, 56222, 62243, 68895, 76242,
  84355, 93311, 103195, 114100, 126127, 139390, 154009, 170118, 187863, 207403, 228914, 252584,
  278623, 307256, 338731, 373318, 411311, 453030, 498824, 549074, 604193, 664632, 730881, 803472,
  882985, 970050, 1065351, 1169633, 1283701, 1408433, 1544780, 1693774, 1856536, 2034279, 2228321,
  2440088, 2671127, 2923113, 3197861, 3497335, 3823663, 4179145, 4566274, 4987741, 5446463, 5945587,
  6488521, 7078945, 7720834, 8418485, 9176537, 10000000, 11404976, 12904567, 14514400, 16242080,
  18095702, 20083886, 22215808, 24501230, 26950540, 29574787, 32385721, 35395838, 38618420,
  42067584, 45758332, 49706603, 53929328, 58444489, 63271179, 68429670, 73941479, 79829440,
  86117783, 92832214, 100000000, 114406130, 130118394, 147319656, 166147618, 186752428, 209297771,
  233962072, 260939787, 290442814, 322702028, 357968938, 396517495, 438646053, 484679494, 534971538,
  589907252, 649905763, 715423218, 786955977, 865044093, 950275074, 1043287971, 1144777804,
  1255500373, 1376277458, 1508002470, 1651646566, 1808265285, 1979005730, 2165114358, 2367945418,
  2588970089, 2829786381, 3092129857, 3377885250, 3689099031, 4027993033, 4396979184, 4798675471,
  5235923207, 5711805728, 6229668624, 6793141628, 7406162301, 8073001662, 8798291902, 9587056372,
  10444742007, 11377254401, 12390995728, 13492905745, 14690506120, 15991948361, 17406065609,
  18942428633, 20611406335, 22424231139, 24393069640, 26531098945, 28852589138, 31372992363,
  34109039054, 37078841860, 40302007875, 43799759843, 47595067021, 51712786465, 56179815564,
  61025256696, 66280594953, 71979889960, 78159982881, 84860719814, 92125192822, 100000000000,
].map(toFixed)
