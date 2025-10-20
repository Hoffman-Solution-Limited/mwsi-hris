import request from 'supertest';
import app from '../app';
import * as db from '../db';

jest.mock('../db');

const mockPool: any = db;

describe('Trainings routes', () => {
  beforeAll(() => {
    mockPool.pool = {
      query: jest.fn().mockImplementation((q: string, vals?: any[]) => {
        if (q.startsWith('INSERT INTO training_records')) {
          const row: any = {
            id: vals ? vals[0] : 't1',
            employee_id: vals ? vals[1] : '1',
            title: vals ? vals[2] : 'Test Training',
            type: vals ? vals[3] : 'development',
            status: vals ? vals[4] : 'not_started',
            completion_date: vals ? vals[5] : null,
            expiry_date: vals ? vals[6] : null,
            provider: vals ? vals[7] : 'Provider',
            created_at: new Date().toISOString(),
            archived: false,
          };
          return Promise.resolve({ rows: [row], rowCount: 1 });
        }
        if (q.startsWith('SELECT * FROM training_records WHERE id')) {
          return Promise.resolve({ rows: [{ id: vals ? vals[0] : 't1', employee_id: '1', title: 'A', status: 'not_started' }], rowCount: 1 });
        }
        if (q.startsWith('UPDATE training_records')) {
          return Promise.resolve({ rows: [{ id: vals ? vals[vals.length-1] : 't1', status: 'completed' }], rowCount: 1 });
        }
        if (q.startsWith('DELETE FROM training_records')) {
          return Promise.resolve({ rows: [], rowCount: 1 });
        }
        if (q.startsWith('SELECT * FROM training_records ORDER BY')) {
          return Promise.resolve({ rows: [{ id: 't1', title: 'Seed' }], rowCount: 1 });
        }
        return Promise.resolve({ rows: [], rowCount: 0 });
      })
    };
  });

  it('creates a training via POST /api/trainings', async () => {
    const res = await request(app)
      .post('/api/trainings')
      .send({ employeeId: '1', title: 'New T', type: 'development', status: 'not_started', provider: 'X' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBeDefined();
  });

  it('updates a training via PUT /api/trainings/:id', async () => {
    const res = await request(app)
      .put('/api/trainings/t1')
      .send({ status: 'completed' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('completed');
  });

  it('deletes a training via DELETE /api/trainings/:id', async () => {
    const res = await request(app)
      .delete('/api/trainings/t1');
    expect(res.status).toBe(204);
  });
});
