/**
 * @jest-environment node
 */
import { SupabaseProvider } from '../../../lib/database/supabase';
import { MongoDBProvider } from '../../../lib/database/mongodb';
import type DatabaseAdapter from '../../../lib/database/adapter';
import type { Profile } from '../../../lib/database/types';
import { randomUUID } from 'crypto';

// Run both Supabase and MongoDB providers for integration tests.
// These tests require valid credentials in your environment (.env).
const providers: DatabaseAdapter[] = [new SupabaseProvider(), new MongoDBProvider()];

providers.forEach((provider) => {
  describe(provider.constructor.name, () => {
    beforeAll(async () => {
      type MaybeLifecycle = { initialize?: () => Promise<void>; close?: () => Promise<void> };
      const lifecycle = provider as unknown as MaybeLifecycle;
      if (typeof lifecycle.initialize === 'function') {
        await lifecycle.initialize();
      }
    });

    afterAll(async () => {
      type MaybeLifecycle = { initialize?: () => Promise<void>; close?: () => Promise<void> };
      const lifecycle = provider as unknown as MaybeLifecycle;
      if (typeof lifecycle.close === 'function') {
        await lifecycle.close();
      }
    });

    test('should create, get, update, and delete a profile', async () => {
      const newProfile: Omit<Profile, 'created_at' | 'updated_at'> = {
        id: randomUUID(),
        full_name: 'Test User',
        role: 'builder',
        email: 'test@example.com',
      };

      // 1. Create
      const createResult = await provider.profiles.create(newProfile);
      expect(createResult.error).toBeNull();
      expect(createResult.data?.id).toBeDefined();
      expect(createResult.data?.full_name).toBe('Test User');

      const createdId = createResult.data?.id ?? newProfile.id;

      // 2. GetById
      const getResult = await provider.profiles.getById(createdId);
      expect(getResult.error).toBeNull();
      expect(getResult.data?.email).toBe('test@example.com');

      // 3. Update
      const updateResult = await provider.profiles.update(createdId, { full_name: 'Test User Updated' });
      expect(updateResult.error).toBeNull();
      expect(updateResult.data?.full_name).toBe('Test User Updated');

      // 4. Delete
      const deleteResult = await provider.profiles.delete(createdId);
      expect(deleteResult.error).toBeNull();

      // 5. GetById (should be null)
      const getAgainResult = await provider.profiles.getById(createdId);
      expect(getAgainResult.error).toBeNull();
      expect(getAgainResult.data).toBeNull();
    });
  });
});
