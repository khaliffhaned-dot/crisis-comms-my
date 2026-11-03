/**
 * Escalate MY — entry
 * Core Enterprise shell (Command Centre, Incident, First 60, Quorum, Clocks,
 * Statements, Audit, Directory) with local / API / war-room backend modes.
 */
import CoreShell from './CoreShell'
import './index.css'
import './modules.css'
import './landing-light.css'

export default function App() {
  return <CoreShell />
}
