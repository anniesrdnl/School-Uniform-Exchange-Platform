import { Route, Routes, Navigate, Link, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import HelpChat, { showsHelpChat } from './components/HelpChat.jsx';
import Icon from './components/Icon.jsx';
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
      {/* extra bottom room where the floating help button sits, so it never covers the end of a page */}
      <main className={`mx-auto max-w-7xl px-4 pt-4 sm:pt-6 lg:px-8 ${showsHelpChat(location.pathname)
        ? 'pb-[calc(9.5rem+env(safe-area-inset-bottom))] md:pb-28'
        : 'pb-[calc(7rem+env(safe-area-inset-bottom))] md:pb-12'}`}>
        {/* keyed by path so each page fades in on navigation */}
        <div key={location.pathname} className="animate-fade-up">
          <Routes>
            <Route path="/" element={user ? <Navigate to="/home" replace /> : <Splash />} />
            <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
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
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-aqua text-navy">
                  <Icon name="search" className="h-8 w-8" />
                </span>
                <h1 className="text-2xl font-extrabold tracking-tight">Page not found</h1>
                <p className="text-slate-600">The page you're looking for doesn't exist or has moved.</p>
                <Link to="/" className="btn-primary mt-2">Go home</Link>
              </div>
            } />
          </Routes>
        </div>
      </main>
      <HelpChat />
    </>
  );
}
