import request from 'supertest';
import app from '../app';
import * as db from '../db';
import { signToken } from '../middleware/auth';

jest.mock('../db');

const mockPool: any = db;

describe('Disciplinary routes', () => {
  beforeAll(() => {
    // mock pool.query for login and insert
    mockPool.pool = {
      query: jest.fn().mockImplementation((q: string, vals?: any[]) => {
        if (q.includes('FROM users WHERE email')) {
          return Promise.resolve({ rows: [{ id: 'u1', email: 'a@b.com', name: 'A', role: 'hr', password: 'demo123' }] });
        }
        if (q.startsWith('INSERT INTO disciplinary_cases')) {
          return Promise.resolve({ rows: [{ id: 'x1', employee_id: vals ? vals[1] : '1', employee_name: (vals ? vals[2] : 'Test'), case_type: vals ? vals[3] : 'misconduct', status: vals ? vals[4] : 'open', date: vals ? vals[5] : null, description: vals ? vals[6] : null, verdict: null, created_at: new Date().toISOString(), updates: [] }] });
        }
        return Promise.resolve({ rows: [] });
      })
    };
  });

  it('POST /api/disciplinary requires auth and role', async () => {
    const token = signToken({ id: 'u1', email: 'a@b.com', role: 'hr' });
    const res = await request(app)
      .post('/api/disciplinary')
      .set('Authorization', `Bearer ${token}`)
      .send({ employeeId: '1', employeeName: 'Test', caseType: 'misconduct' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });
});
