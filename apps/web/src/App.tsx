import { useCallback, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { AppShell } from '@/components/AppShell'
import { BoardBrief } from '@/pages/BoardBrief'
import { CommandCentre } from '@/pages/CommandCentre'
import { IncidentDetails } from '@/pages/IncidentDetails'

function App() {
  const [activeIncidentId, setActiveIncidentId] = useState<string | null>(null)
  const onActiveIncident = useCallback((id: string | null) => setActiveIncidentId(id), [])

  return (
    <AppShell activeIncidentId={activeIncidentId}>
      <Routes>
        <Route path="/" element={<CommandCentre onActiveIncident={onActiveIncident} />} />
        <Route path="/incident/:id" element={<IncidentDetails onActiveIncident={onActiveIncident} />} />
        <Route
          path="/incident"
          element={activeIncidentId ? <Navigate to={`/incident/${activeIncidentId}`} replace /> : <IncidentDetails onActiveIncident={onActiveIncident} />}
        />
        <Route path="/board-brief" element={<BoardBrief onActiveIncident={onActiveIncident} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}

export default App
