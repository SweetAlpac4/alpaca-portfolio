import { useEffect } from 'react'
import { gameMilestones } from '../lib/gameMilestones'
import { useAchievements } from './AchievementProvider'
import { useFishing } from './FishingProvider'
import { useNether } from './NetherProvider'
import { useCave } from './CaveProvider'

export function GameMilestones() {
  const { state: fishing } = useFishing()
  const { state: nether } = useNether()
  const { state: cave } = useCave()
  const { unlock } = useAchievements()
  useEffect(() => {
    for (const id of gameMilestones(fishing, nether, cave)) unlock(id)
  }, [fishing, nether, cave, unlock])
  return null
}
