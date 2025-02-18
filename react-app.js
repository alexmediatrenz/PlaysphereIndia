import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/ui/theme-provider';
import store from './redux/store';

// Layout components
import MainLayout from './components/layouts/MainLayout';
import AuthLayout from './components/layouts/AuthLayout';

// Page components
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import GameLibrary from './pages/games/GameLibrary';
import GameRoom from './pages/games/GameRoom';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

// Auth guard component
import PrivateRoute from './components/auth/PrivateRoute';

// Notification provider
import { Toaster } from '@/components/ui/toaster';

const App = () => {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Protected routes */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route element={<PrivateRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/games" element={<GameLibrary />} />
                <Route path="/games/:gameId" element={<GameRoom />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>
          </Routes>
          <Toaster />
        </Router>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
