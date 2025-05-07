import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, MenuItem, Select, InputLabel, FormControl, Dialog, DialogTitle, DialogContent, DialogActions, Alert } from '@mui/material';
import axios from 'axios';

const priorities = ['low', 'medium', 'high'];
const statuses = ['todo', 'in progress', 'done'];

const TaskForm = ({ open, handleClose, token, onSuccess, initialData }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    status: 'todo',
    assignedTo: ''
  });
  const [recurrence, setRecurrence] = useState({ frequency: '', interval: 1, endDate: '' });
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({ ...initialData, dueDate: initialData.dueDate ? initialData.dueDate.substring(0,10) : '' });
      if (initialData.recurringRule) {
        setRecurrence({
          frequency: initialData.recurringRule.frequency || '',
          interval: initialData.recurringRule.interval || 1,
          endDate: initialData.recurringRule.endDate ? initialData.recurringRule.endDate.substring(0,10) : ''
        });
      }
    }
  }, [initialData]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('/api/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (err) {
        setUsers([]);
      }
    };
    fetchUsers();
  }, [token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = { ...form };
      if (recurrence.frequency) {
        payload.recurringRule = {
          frequency: recurrence.frequency,
          interval: recurrence.interval,
          endDate: recurrence.endDate || null
        };
      }
      if (initialData && initialData._id) {
        await axios.put(`/api/tasks/${initialData._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post('/api/tasks', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      onSuccess();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{initialData ? 'Edit Task' : 'Create Task'}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error">{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="title"
            label="Title"
            name="title"
            value={form.title}
            onChange={handleChange}
          />
          <Box mt={2}>
            <FormControl fullWidth>
              <InputLabel id="recurrence-label">Recurrence</InputLabel>
              <Select
                labelId="recurrence-label"
                id="recurrence-frequency"
                value={recurrence.frequency}
                label="Recurrence"
                onChange={e => setRecurrence({ ...recurrence, frequency: e.target.value })}
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
              </Select>
            </FormControl>
            {recurrence.frequency && (
              <Box display="flex" gap={2} mt={1}>
                <TextField
                  label="Interval"
                  type="number"
                  inputProps={{ min: 1 }}
                  value={recurrence.interval}
                  onChange={e => setRecurrence({ ...recurrence, interval: Number(e.target.value) })}
                  sx={{ width: 120 }}
                />
                <TextField
                  label="End Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={recurrence.endDate}
                  onChange={e => setRecurrence({ ...recurrence, endDate: e.target.value })}
                  sx={{ width: 200 }}
                />
              </Box>
            )}
          </Box>
          <TextField label="Description" name="description" value={form.description} onChange={handleChange} fullWidth margin="normal" multiline rows={2} />
          <TextField label="Due Date" name="dueDate" type="date" value={form.dueDate} onChange={handleChange} fullWidth margin="normal" InputLabelProps={{ shrink: true }} />
          <FormControl fullWidth margin="normal">
            <InputLabel>Priority</InputLabel>
            <Select name="priority" value={form.priority} onChange={handleChange} label="Priority">
              {priorities.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select name="status" value={form.status} onChange={handleChange} label="Status">
              {statuses.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Assign To</InputLabel>
            <Select name="assignedTo" value={form.assignedTo} onChange={handleChange} label="Assign To">
              <MenuItem value="">Unassigned</MenuItem>
              {users.map(u => <MenuItem key={u._id} value={u._id}>{u.name} ({u.email})</MenuItem>)}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>{initialData ? 'Save' : 'Create'}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskForm;
