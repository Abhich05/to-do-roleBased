import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Box, Typography, Button, CircularProgress, Tabs, Tab, Alert, Snackbar, Card, CardContent } from '@mui/material';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';
import TaskSearchBar from '../components/TaskSearchBar';

const Dashboard = () => {
  const { user, logout, token } = useContext(AuthContext);
  const [tab, setTab] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifMsg, setNotifMsg] = useState('');
  const [filters, setFilters] = useState({});

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setError('');
      try {
        const params = {};
        if (filters.search) params.search = filters.search;
        if (filters.status) params.status = filters.status;
        if (filters.priority) params.priority = filters.priority;
        if (filters.dueDate) params.dueDate = filters.dueDate;
        const res = await axios.get('/api/tasks', {
          headers: { Authorization: `Bearer ${token}` },
          params
        });
        setTasks(res.data);
        // Notification logic
        const assignedTasks = res.data.filter(t => t.assignedTo && t.assignedTo._id === user.id);
        const lastSeenIds = JSON.parse(localStorage.getItem('lastSeenAssignedTaskIds') || '[]');
        const newAssigned = assignedTasks.filter(t => !lastSeenIds.includes(t._id));
        if (newAssigned.length > 0) {
          setNotifMsg(`You have ${newAssigned.length} new assigned task${newAssigned.length > 1 ? 's' : ''}!`);
          setNotifOpen(true);
          localStorage.setItem('lastSeenAssignedTaskIds', JSON.stringify(assignedTasks.map(t => t._id)));
        }
      } catch (err) {
        setError('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
    // Expose for refresh
    Dashboard.fetchTasks = fetchTasks;
    Dashboard.fetchTasksWithFilters = fetchTasks;
  }, [token, user.id, filters]);

  // Filtering logic for dashboard tabs
  const assignedTasks = tasks.filter(t => t.assignedTo && t.assignedTo._id === user.id);
  const createdTasks = tasks.filter(t => t.createdBy && t.createdBy._id === user.id);
  const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done');

  // Search handler
  const handleSearch = (searchFilters) => {
    setFilters(searchFilters);
  };

  // Edit handler
  const handleEdit = (task) => {
    setTaskToEdit(task);
    setTaskFormOpen(true);
  };

  // Delete handler
  const handleDelete = async (task) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await axios.delete(`/api/tasks/${task._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Dashboard.fetchTasks();
    } catch (err) {
      alert('Failed to delete task');
    }
  };

  return (
    <Box maxWidth={900} mx="auto" mt={4} px={{ xs: 1, sm: 2, md: 4 }}>
      <Card sx={{ boxShadow: 2, borderRadius: 2, mb: 3, p: { xs: 2, sm: 3 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Typography variant="h5" fontWeight={700} color="primary.main">Welcome, {user.name}</Typography>
          <Box>
            <Button variant="contained" color="primary" onClick={() => setTaskFormOpen(true)}>
              + New Task
            </Button>
          </Box>
        </Box>
      </Card>
      <Card sx={{ boxShadow: 1, borderRadius: 2, mb: 3, p: { xs: 2, sm: 3 } }}>
        <TaskSearchBar onSearch={handleSearch} />
      </Card>
      <Card sx={{ boxShadow: 1, borderRadius: 2, p: { xs: 2, sm: 3 } }}>

      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5">Welcome, {user.name}</Typography>
        <Box>
          <Button variant="contained" color="primary" sx={{ mr: 2 }} onClick={() => { setTaskToEdit(null); setTaskFormOpen(true); }}>Create Task</Button>
          <Button onClick={logout} color="error">Logout</Button>
        </Box>
      </Box>
      <TaskSearchBar onSearch={Dashboard.fetchTasksWithFilters} />
      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mt: 2 }}>
        <Tab label={`Assigned to Me (${assignedTasks.length})`} />
        <Tab label={`Created by Me (${createdTasks.length})`} />
        <Tab label={`Overdue Tasks (${overdueTasks.length})`} />
      </Tabs>
      {loading ? (
        <Box mt={4} display="flex" justifyContent="center"><CircularProgress /></Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      ) : (
        <Box mt={2}>
          {tab === 0 && <TaskList tasks={assignedTasks} user={user} onEdit={handleEdit} onDelete={handleDelete} />}
          {tab === 1 && <TaskList tasks={createdTasks} user={user} onEdit={handleEdit} onDelete={handleDelete} />}
          {tab === 2 && <TaskList tasks={overdueTasks} user={user} onEdit={handleEdit} onDelete={handleDelete} />}
        </Box>
      )}
      <TaskForm
        open={taskFormOpen}
        handleClose={() => setTaskFormOpen(false)}
        token={token}
        onSuccess={() => Dashboard.fetchTasks()}
        initialData={taskToEdit}
      />
      <Snackbar
        open={notifOpen}
        autoHideDuration={4000}
        onClose={() => setNotifOpen(false)}
        message={notifMsg}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
      </Card>
    </Box>
  );
};

export default Dashboard;
