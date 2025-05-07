const request = require('supertest');
const app = require('../index');
const mongoose = require('mongoose');
const Task = require('../models/Task');
const User = require('../models/User');
const RecurringRule = require('../models/RecurringRule');

let token, userId;

describe('Task API', () => {
  beforeAll(async () => {
    // Connect to test DB, create a user and get token
    // ...mock user creation and login here...
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should create a task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test Task', dueDate: new Date(), priority: 'medium', status: 'todo' });
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Test Task');
  });

  it('should create a recurring task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Recurring Task',
        dueDate: new Date(),
        recurringRule: { frequency: 'weekly', interval: 2 }
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Recurring Task');
    expect(res.body.recurringRule).toBeDefined();
  });

  // More tests: update, delete, RBAC, notifications, analytics endpoints, etc.
});
