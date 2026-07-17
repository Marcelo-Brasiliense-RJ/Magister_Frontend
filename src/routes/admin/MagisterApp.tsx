import { Navigate, Route, Routes } from 'react-router-dom';
import { MagisterProvider } from './store';
import { Toasts } from './Toasts';
import { Shell } from './Shell';
import { Login } from './Login';
import { TutorList } from './TutorList';
import { TutorDetail } from './TutorDetail';
import { Analytics } from './Analytics';
import { Docs } from './Docs';
import { Settings } from './Settings';
import './magister.css';

// Superficie do painel admin. Tudo dentro de `.magister` para os tokens
// escopados do design system valerem (e nao vazarem para o widget /embed).
export function MagisterApp() {
  return (
    <MagisterProvider>
      <div className="magister">
        <Routes>
          <Route path="login" element={<Login />} />
          <Route element={<Shell />}>
            <Route index element={<TutorList />} />
            <Route path="tutors/new" element={<TutorDetail />} />
            <Route path="tutors/:id" element={<TutorDetail />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="docs" element={<Docs />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>
        </Routes>
        <Toasts />
      </div>
    </MagisterProvider>
  );
}
