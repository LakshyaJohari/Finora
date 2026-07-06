import { Route, Routes } from 'react-router-dom'
import { Shell } from './components/Shell'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Expenses from './pages/Expenses'
import Goals from './pages/Goals'
import Advisor from './pages/Advisor'
import Profile from './pages/Profile'
import Login from './pages/Login'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Shell />}>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/advisor" element={<Advisor />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
    </Routes>
  )
}
