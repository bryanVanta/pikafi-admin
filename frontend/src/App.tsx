import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AdminDashboard } from './pages/AdminDashboard';
import { CardDetailsPage } from './pages/CardDetailsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/grading/:id" element={<CardDetailsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
