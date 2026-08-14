import { describe, it, expect, afterEach } from 'vitest';
import { planService } from '../../api/planService';
import { mockFetchOnce } from '../testUtils';

describe('planService', () => {
  afterEach(() => {
    delete global.fetch;
  });

  it('create() posts to /api/users/{userId}/plans and maps the response', async () => {
    mockFetchOnce({
      status: 201,
      body: { id: 'p1', userId: 'u1', name: 'Weekend in GDL', description: null, createdAt: '2026-01-01' },
    });

    const plan = await planService.create('u1', { name: 'Weekend in GDL' });

    const [url, options] = fetch.mock.calls[0];
    expect(url).toContain('/api/users/u1/plans');
    expect(options.method).toBe('POST');
    expect(plan.userId).toBe('u1');
  });

  it('listByUser() fetches and maps an array of plans', async () => {
    mockFetchOnce({
      status: 200,
      body: [{ id: 'p1', userId: 'u1', name: 'Trip A', description: null, createdAt: '2026-01-01' }],
    });

    const plans = await planService.listByUser('u1');

    expect(fetch.mock.calls[0][0]).toContain('/api/users/u1/plans');
    expect(plans).toHaveLength(1);
    expect(plans[0].name).toBe('Trip A');
  });

  it('getById() throws ApiError with the backend message on 404', async () => {
    mockFetchOnce({ status: 404, body: { message: 'Plan not found: p1' } });

    await expect(planService.getById('p1')).rejects.toThrow('Plan not found: p1');
  });

  it('update() sends PUT to /api/plans/{id} and maps the updated plan', async () => {
    mockFetchOnce({
      status: 200,
      body: { id: 'p1', userId: 'u1', name: 'Trip A', description: 'Updated', createdAt: '2026-01-01' },
    });

    const plan = await planService.update('p1', { description: 'Updated' });

    const [url, options] = fetch.mock.calls[0];
    expect(url).toContain('/api/plans/p1');
    expect(options.method).toBe('PUT');
    expect(plan.description).toBe('Updated');
  });

  it('remove() sends DELETE to /api/plans/{id}', async () => {
    mockFetchOnce({ status: 204 });

    await planService.remove('p1');

    expect(fetch.mock.calls[0][1].method).toBe('DELETE');
  });
});