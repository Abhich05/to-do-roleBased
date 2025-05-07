import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Box, Typography, CircularProgress, Alert, Paper } from '@mui/material';
import axios from 'axios';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const AnalyticsDashboard = () => {
  const { token, user } = useContext(AuthContext);
  const [completedPerUser, setCompletedPerUser] = useState([]);
  const [overdueCount, setOverdueCount] = useState(0);
  const [completionRate, setCompletionRate] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError('');
      try {
        const [compRes, overdueRes, rateRes] = await Promise.all([
          axios.get('/api/analytics/completed-per-user', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/analytics/overdue', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/analytics/completion-rate', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setCompletedPerUser(compRes.data);
        setOverdueCount(overdueRes.data.count);
        setCompletionRate(rateRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error loading analytics');
      } finally {
        setLoading(false);
      }
    };
    if (user && (user.role === 'admin' || user.role === 'manager')) fetchAnalytics();
  }, [token, user]);

  if (!user || (user.role !== 'admin' && user.role !== 'manager')) return <Alert severity="error">Access denied. Admins and managers only.</Alert>;

  return (
    <Box maxWidth={1200} mx="auto" mt={4}>
      <Typography variant="h4" mb={2}>Analytics Dashboard</Typography>
      {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : (
        <>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6">Overdue Tasks: {overdueCount}</Typography>
          </Paper>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" mb={2}>Completed Tasks per User</Typography>
            <Bar
              data={{
                labels: completedPerUser.map(u => u._id),
                datasets: [{
                  label: 'Completed Tasks',
                  data: completedPerUser.map(u => u.count),
                  backgroundColor: 'rgba(54, 162, 235, 0.6)'
                }]
              }}
              options={{ responsive: true, plugins: { legend: { display: false } } }}
            />
          </Paper>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" mb={2}>Task Completion Rate (by Month)</Typography>
            <Line
              data={{
                labels: completionRate.map(r => r._id),
                datasets: [{
                  label: 'Completed Tasks',
                  data: completionRate.map(r => r.count),
                  fill: false,
                  borderColor: 'rgba(75,192,192,1)',
                  tension: 0.1
                }]
              }}
              options={{ responsive: true }}
            />
          </Paper>
        </>
      )}
    </Box>
  );
};

export default AnalyticsDashboard;
