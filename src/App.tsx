import { Route, Routes } from 'react-router-dom'
import { MusicProvider } from './components/MusicPlayer'
import { AchievementProvider } from './components/AchievementProvider'
import { FishingProvider } from './components/FishingProvider'
import { NetherProvider } from './components/NetherProvider'
import { CaveProvider } from './components/CaveProvider'
import { Portfolio } from './Portfolio'
import { AdminPage } from './admin/AdminPage'

export default function App() {
  return (
    <MusicProvider>
      <Routes>
        <Route
          path="/"
          element={
            <AchievementProvider>
              <FishingProvider>
                <CaveProvider>
                  <NetherProvider><Portfolio /></NetherProvider>
                </CaveProvider>
              </FishingProvider>
            </AchievementProvider>
          }
        />
        <Route path="/admin/*" element={<AdminPage />} />
      </Routes>
    </MusicProvider>
  )
}
