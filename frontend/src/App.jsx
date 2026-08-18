import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Inspections from './pages/Inspections';
import LiveStream from './pages/LiveStream';
import FlightPlanner from './pages/FlightPlanner';
import Login from './pages/Login';
import DroneDiagnostics from './pages/DroneDiagnostics';
import InteractiveFlightPlanner from './pages/InteractiveFlightPlanner';
import GlobalMap from './pages/GlobalMap';
import Settings from './pages/Settings';

const RequireAuth = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RequireAuth><AppLayout /></RequireAuth>}>
          <Route index element={<Dashboard />} />
          <Route path="inspections" element={<Inspections />} />
          <Route path="live" element={<LiveStream />} />
          <Route path="flight-planner" element={<FlightPlanner />} />
          <Route path="diagnostics" element={<DroneDiagnostics />} />
          <Route path="flight-planner-interactive" element={<InteractiveFlightPlanner />} />
          <Route path="global-map" element={<GlobalMap />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
