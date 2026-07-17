import { Navigate, Route, Routes } from 'react-router-dom';
import { MagisterApp } from '@/routes/admin/MagisterApp';
import { Widget } from '@/routes/embed/Widget';

// Dois surfaces: /admin (painel Magister) e /embed (widget enxuto no iframe).
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="/embed" element={<Widget />} />
      <Route path="/admin/*" element={<MagisterApp />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
