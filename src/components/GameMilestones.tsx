import { useEffect } from 'react'
import { gameMilestones } from '../lib/gameMilestones'
import { useAchievements } from './AchievementProvider'
import { useFishing } from './FishingProvider'
import { useNether } from './NetherProvider'

export function GameMilestones() {
  const { state: fishing } = useFishing()
  const { state: nether } = useNether()
  const { unlock } = useAchievements()
  useEffect(() => {
    for (const id of gameMilestones(fishing, nether)) unlock(id)
  }, [fishing, nether, unlock])
  return null
}
