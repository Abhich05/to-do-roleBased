import React from 'react';
import { Box, Card, CardContent, Typography, Chip, Stack, Button, Divider } from '@mui/material';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';

const TaskList = ({ tasks, user, onEdit, onDelete }) => {
  if (!tasks.length) return (
    <Box textAlign="center" mt={4}>
      <AssignmentTurnedInIcon sx={{ fontSize: 60, color: 'grey.400' }} />
      <Typography variant="h6" color="text.secondary">No tasks found.</Typography>
    </Box>
  );
  return (
    <Stack spacing={2}>
      {tasks.map((task, idx) => (
        <React.Fragment key={task._id}>
          <Card variant="outlined" sx={{ boxShadow: 2, borderRadius: 2, transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 6, borderColor: 'primary.light' } }}>
            <CardContent>
              <Box display={{ xs: 'block', sm: 'flex' }} justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight={600}>{task.title}</Typography>
                <Chip label={task.status} color={task.status === 'done' ? 'success' : task.status === 'in progress' ? 'warning' : 'info'} sx={{ mt: { xs: 1, sm: 0 }, fontWeight: 700, letterSpacing: 0.5 }} />
              </Box>
              <Typography color="text.secondary" mt={1}>{task.description}</Typography>
              <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
                <Chip label={`Priority: ${task.priority}`} size="small" color={task.priority === 'high' ? 'error' : task.priority === 'medium' ? 'warning' : 'default'} />
                {task.dueDate && <Chip label={`Due: ${new Date(task.dueDate).toLocaleDateString()}`} size="small" color="secondary" />}
                {task.assignedTo && <Chip label={`Assigned: ${task.assignedTo.name}`} size="small" color="primary" />}
              </Box>
              {/* Edit/Delete buttons based on RBAC */}
              {user && (
                (user.role === 'admin' ||
                 (user.role === 'manager' && task.assignedTo && task.assignedTo._id === user.id) ||
                 (user.role === 'user' && task.createdBy && task.createdBy._id === user.id)) && (
                  <Box mt={2} display="flex" gap={1}>
                    <Button size="small" variant="contained" color="primary" onClick={() => onEdit(task)}>
                      Edit
                    </Button>
                    {/* Only admin or creator can delete */}
                    {(user.role === 'admin' || (task.createdBy && task.createdBy._id === user.id)) && (
                      <Button size="small" variant="contained" color="error" onClick={() => onDelete(task)}>
                        Delete
                      </Button>
                    )}
                  </Box>
                )
              )}
            </CardContent>
          </Card>
          {idx < tasks.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </Stack>
  );
};

export default TaskList;
