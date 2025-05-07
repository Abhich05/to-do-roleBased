import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';

const AuditLog = () => {
  const { token, user } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get('/api/audit', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLogs(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error loading audit logs');
      } finally {
        setLoading(false);
      }
    };
    if (user && user.role === 'admin') fetchLogs();
  }, [token, user]);

  if (!user || user.role !== 'admin') return <Alert severity="error">Access denied. Admins only.</Alert>;

  return (
    <Box maxWidth={1200} mx="auto" mt={4}>
      <Typography variant="h4" mb={2}>Audit Logs</Typography>
      {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Target Type</TableCell>
                <TableCell>Target ID</TableCell>
                <TableCell>Details</TableCell>
                <TableCell>Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map(log => (
                <TableRow key={log._id}>
                  <TableCell>{log.user?.name} ({log.user?.role})</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>{log.targetType}</TableCell>
                  <TableCell>{log.targetId}</TableCell>
                  <TableCell><pre style={{margin:0, fontSize:12}}>{JSON.stringify(log.details, null, 2)}</pre></TableCell>
                  <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default AuditLog;
