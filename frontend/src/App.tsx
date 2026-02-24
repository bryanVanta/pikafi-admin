import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AdminDashboard } from './pages/AdminDashboard';
import { SubmissionsPage } from './pages/SubmissionsPage';
import { CardDetailsPage } from './pages/CardDetailsPage';
import { GradingWorkflowPage } from './pages/GradingWorkflowPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/submissions" element={<SubmissionsPage />} />
        <Route path="/admin" element={<Navigate to="/submissions" replace />} />
        <Route path="/card/:id" element={<CardDetailsPage />} />
        <Route path="/grading/:id" element={<GradingWorkflowPage />} />
      </Routes>
    </Router>
  );
}

export default App;
