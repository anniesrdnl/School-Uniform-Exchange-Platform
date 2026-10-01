import { Route, Routes, Navigate, Link, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Browse from './pages/Browse.jsx';
import ListingDetails from './pages/ListingDetails.jsx';
import Sell from './pages/Sell.jsx';
import Messages from './pages/Messages.jsx';
import Profile from './pages/Profile.jsx';
import Admin from './pages/Admin.jsx';
import Splash from './pages/Splash.jsx';
import { useAuth } from './context/AuthContext.jsx';

export default function App() {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-6 md:pb-12">
        {/* keyed by path so each page fades in on navigation */}
        <div key={location.pathname} className="animate-fade-up">
        <Routes>
          <Route 
            path="/" 
            element={user ? <Navigate to="/home" replace /> : <Splash />} 
          />
          <Route 
            path="/home" 
            element={<ProtectedRoute><Home /></ProtectedRoute>} 
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/listings/:id" element={<ListingDetails />} />
          <Route path="/sell" element={<ProtectedRoute><Sell /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute admin><Admin /></ProtectedRoute>} />
          <Route path="*" element={
            <div className="flex flex-col items-center gap-3 py-24 text-center">
              <p className="text-7xl font-extrabold text-navy/15">404</p>
              <p className="text-slate-500">Page not found.</p>
              <Link to="/" className="btn-outline mt-2">Go home</Link>
            </div>
          } />
        </Routes>
        </div>
      </main>
    </>
  );
}