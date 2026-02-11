import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AdminDashboard } from './pages/AdminDashboard';
import { GradingList } from './pages/GradingList';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/submissions" element={<GradingList />} />
      </Routes>
    </Router>
  );
}

export default App;
