import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import { ToastProvider } from '@/components/ui';
import { AdminLayout } from '@/routes/admin/AdminLayout';
import { Login } from '@/routes/admin/Login';
import { TutorList } from '@/routes/admin/TutorList';
import { TutorForm } from '@/routes/admin/TutorForm';
import { EmbedSnippet } from '@/routes/admin/EmbedSnippet';
import { Widget } from '@/routes/embed/Widget';

// Dois surfaces: /admin (painel, com providers) e /embed (widget enxuto no iframe).
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="/embed" element={<Widget />} />
      <Route path="/admin/*" element={<AdminApp />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}

function AdminApp() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="login" element={<Login />} />
          <Route element={<AdminLayout />}>
            <Route index element={<TutorList />} />
            <Route path="tutors/new" element={<TutorForm />} />
            <Route path="tutors/:id" element={<TutorForm />} />
            <Route path="tutors/:id/embed" element={<EmbedSnippet />} />
          </Route>
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}
