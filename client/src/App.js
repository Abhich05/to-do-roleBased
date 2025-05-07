import React, { useContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AuditLog from './pages/AuditLog';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import socket from './socket';
import AdminRoute from './components/AdminRoute';
import { Snackbar } from '@mui/material';

function PrivateRoute({ children }) {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" />;
}

function App() {
  const { user } = useContext(AuthContext) || {};
  const [notif, setNotif] = useState(null);

  useEffect(() => {
    if (user && user.id) {
      socket.connect();
      socket.emit('register', user.id);
      socket.on('taskAssigned', (data) => {
        setNotif(data.message);
      });
    } else {
      socket.disconnect();
    }
    return () => {
      socket.off('taskAssigned');
    };
  }, [user]);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/audit" element={<PrivateRoute><AuditLog /></PrivateRoute>} />
          <Route path="/analytics" element={<AdminRoute><AnalyticsDashboard /></AdminRoute>} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
        <Snackbar
          open={!!notif}
          autoHideDuration={4000}
          onClose={() => setNotif(null)}
          message={notif}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
