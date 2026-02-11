import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AdminDashboard } from './pages/AdminDashboard';
import { GradingList } from './pages/GradingList';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GradingList />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
