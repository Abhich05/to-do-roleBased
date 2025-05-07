import React, { useState } from 'react';
import { Box, TextField, MenuItem, Button, Paper, FormControl, Select, InputLabel } from '@mui/material';

const priorities = ['', 'low', 'medium', 'high'];
const statuses = ['', 'todo', 'in progress', 'done'];

const TaskSearchBar = ({ onSearch }) => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ search, status, priority, dueDate });
  };

  const handleClear = () => {
    setSearch(''); setStatus(''); setPriority(''); setDueDate('');
    onSearch({ search: '', status: '', priority: '', dueDate: '' });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} display="flex" gap={2} alignItems="center" mb={2}>
      <TextField label="Search" value={search} onChange={e => setSearch(e.target.value)} size="small" />
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Status</InputLabel>
        <Select value={status} label="Status" onChange={e => setStatus(e.target.value)}>
          {statuses.map(s => <MenuItem key={s} value={s}>{s || 'Any'}</MenuItem>)}
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Priority</InputLabel>
        <Select value={priority} label="Priority" onChange={e => setPriority(e.target.value)}>
          {priorities.map(p => <MenuItem key={p} value={p}>{p || 'Any'}</MenuItem>)}
        </Select>
      </FormControl>
      <TextField label="Due Before" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} InputLabelProps={{ shrink: true }} size="small" />
      <Button type="submit" variant="contained">Search</Button>
      <Button onClick={handleClear}>Clear</Button>
    </Box>
  );
};

export default TaskSearchBar;
