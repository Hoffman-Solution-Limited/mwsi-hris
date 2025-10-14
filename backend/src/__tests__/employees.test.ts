import request from 'supertest';
import app from '../app';
import * as db from '../db';
import { v4 as uuidv4 } from 'uuid';

jest.mock('../db');

const mockPool: any = db;

describe('Employees routes', () => {
  beforeAll(() => {
    mockPool.pool = {
      query: jest.fn().mockImplementation((q: string, vals?: any[]) => {
        if (q.startsWith('INSERT INTO employees')) {
          // return inserted row - server sends id first then provided fields
          const row: any = { id: vals ? vals[0] : uuidv4(), name: vals && vals[1] != null ? vals[1] : 'Test', email: vals && vals[2] != null ? vals[2] : null };
          return Promise.resolve({ rows: [row], rowCount: 1 });
        }
        if (q.startsWith('UPDATE employees')) {
          const row: any = { id: vals ? vals[vals.length-1] : '1', name: 'Updated' };
          return Promise.resolve({ rows: [row], rowCount: 1 });
        }
        if (q.includes('SELECT * FROM employees WHERE id')) {
          return Promise.resolve({ rows: [{ id: vals ? vals[0] : '1', name: 'Test', email: 't@e.com' }], rowCount: 1 });
        }
        return Promise.resolve({ rows: [], rowCount: 0 });
      })
    };
  });

  it('creates an employee via POST /api/employees', async () => {
    const res = await request(app)
      .post('/api/employees')
      .send({ name: 'Test', email: 't@e.com', position: 'Eng' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Test');
  });

  it('updates an employee via PUT /api/employees/:id', async () => {
    const res = await request(app)
      .put('/api/employees/1')
      .send({ name: 'Updated' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated');
  });
});
