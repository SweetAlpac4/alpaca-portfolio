import { ACHIEVEMENTS, type AchievementId } from './achievements.ts'

export function canReadAfterword(unlocked: ReadonlySet<AchievementId>) {
  return ACHIEVEMENTS.every(({ id }) => unlocked.has(id))
}
