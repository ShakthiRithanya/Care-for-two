import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AuthorizerDashboard from './pages/AuthorizerDashboard';
import HospitalDashboard from './pages/HospitalDashboard';
import BeneficiaryDashboard from './pages/BeneficiaryDashboard';
import AdminDashboard from './pages/AdminDashboard';
import RegisterBeneficiary from './pages/RegisterBeneficiary';
import RegisterAdmin from './pages/RegisterAdmin';
import Architecture from './pages/Architecture';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminHospitals from './pages/AdminHospitals';
import AdminAuthorizers from './pages/AdminAuthorizers';
import AdminAddUser from './pages/AdminAddUser';
import AuthorizerAnalytics from './pages/AuthorizerAnalytics';
import AuthorizerHighRisk from './pages/AuthorizerHighRisk';
import AuthorizerOffTrack from './pages/AuthorizerOffTrack';
import AuthorizerApprovals from './pages/AuthorizerApprovals';
import AuthorizerHospitals from './pages/AuthorizerHospitals';
import AIAgentPage from './pages/AIAgentPage';
import AIAssistant from './components/AIAssistant';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterBeneficiary />} />
          <Route path="/register-admin" element={<RegisterAdmin />} />
          <Route path="/architecture" element={<Architecture />} />

          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/dashboard/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/dashboard/admin/hospitals" element={<AdminHospitals />} />
          <Route path="/dashboard/admin/authorizers" element={<AdminAuthorizers />} />
          <Route path="/dashboard/admin/add-user" element={<AdminAddUser />} />
          <Route path="/dashboard/authorizer" element={<AuthorizerDashboard />} />
          <Route path="/dashboard/authorizer/analytics" element={<AuthorizerAnalytics />} />
          <Route path="/dashboard/authorizer/highrisk" element={<AuthorizerHighRisk />} />
          <Route path="/dashboard/authorizer/offtrack" element={<AuthorizerOffTrack />} />
          <Route path="/dashboard/authorizer/approvals" element={<AuthorizerApprovals />} />
          <Route path="/dashboard/authorizer/hospitals" element={<AuthorizerHospitals />} />
          <Route path="/dashboard/hospital" element={<HospitalDashboard />} />
          <Route path="/dashboard/hospital" element={<HospitalDashboard />} />
          <Route path="/dashboard/beneficiary" element={<BeneficiaryDashboard />} />
          <Route path="/ai-agent" element={<AIAgentPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <AIAssistant />
      </div>
    </Router>
  );
}

export default App;
