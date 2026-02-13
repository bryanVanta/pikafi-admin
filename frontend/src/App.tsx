import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AdminDashboard } from './pages/AdminDashboard';
import { CardDetailsPage } from './pages/CardDetailsPage';
import { GradingWorkflowPage } from './pages/GradingWorkflowPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/card/:id" element={<CardDetailsPage />} />
        <Route path="/grading/:id" element={<GradingWorkflowPage />} />
      </Routes>
    </Router>
  );
}

export default App;
