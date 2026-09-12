import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import App from './App.tsx'
import AdminLogin from './pages/AdminLogin.tsx'
import JoinUs from './pages/JoinUs.tsx'
import ProtectedRoute from './auth/ProtectedRoute.tsx'
import AdminLayout from './components/admin/AdminLayout.tsx'
import AdminDashboardHome from './pages/admin/Dashboard.tsx'
import AdminTeamPage from './pages/admin/Team.tsx'
import AdminProjectsPage from './pages/admin/Projects.tsx'
import AdminAchievementsPage from './pages/admin/Achievements.tsx'
import AdminEventsPage from './pages/admin/Events.tsx'
import AdminEventJoinRequestsPage from './pages/admin/EventJoinRequests.tsx'
import AdminJoinRequestsPage from './pages/admin/JoinRequests.tsx'
import AdminMediaPage from './pages/admin/Media.tsx'
import AdminSettingsPage from './pages/admin/Settings.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* The entire cinematic single-page site — untouched, still owns
            every scene transition and its own internal hash navigation. */}
        <Route path="/" element={<App />} />

        {/* /join-us is one complete normal scrolling page — Explore Domains
            and Apply Now are in-page sections (#domains, #apply), not
            separate routes. */}
        <Route path="/join-us" element={<JoinUs />} />

        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Every /admin/* page below shares one persistent sidebar/header
            shell (AdminLayout) and sits behind the same auth gate — the
            backend re-enforces that gate on every mutation regardless. */}
        <Route
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin" element={<AdminDashboardHome />} />
          <Route path="/admin/team" element={<AdminTeamPage />} />
          <Route path="/admin/projects" element={<AdminProjectsPage />} />
          <Route path="/admin/achievements" element={<AdminAchievementsPage />} />
          <Route path="/admin/events" element={<AdminEventsPage />} />
          <Route path="/admin/join-requests" element={<AdminJoinRequestsPage />} />
          <Route path="/admin/event-join-requests" element={<AdminEventJoinRequestsPage />} />
          <Route path="/admin/media" element={<AdminMediaPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
