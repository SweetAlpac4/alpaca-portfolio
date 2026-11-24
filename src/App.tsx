import { Route, Routes } from 'react-router-dom'
import { MusicProvider } from './components/MusicPlayer'
import { AchievementProvider } from './components/AchievementProvider'
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
              <Portfolio />
            </AchievementProvider>
          }
        />
        <Route path="/admin/*" element={<AdminPage />} />
      </Routes>
    </MusicProvider>
  )
}
