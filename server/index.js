require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const http = require('http');
const { initSocket } = require('./socket');
const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/task'));
app.use('/api/users', require('./routes/user'));
app.use('/api/audit', require('./routes/audit'));
app.use('/api/analytics', require('./routes/analytics'));

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => {
  res.send('Task Management System API');
});

const server = http.createServer(app);
initSocket(server);
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
