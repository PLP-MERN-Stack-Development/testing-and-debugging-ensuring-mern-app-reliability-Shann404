// tests/performance/databasePerformance.test.js
describe('Database Performance', () => {
  beforeAll(async () => {
    await connectTestDB();
    // Create large dataset for performance testing
    await UserFactory.createMultipleUsers(1000);
  });

  afterAll(async () => {
    await closeTestDB();
  });

  test('should query users with pagination efficiently', async () => {
    const page = 1;
    const limit = 50;
    
    const startTime = Date.now();
    
    const users = await User.find({})
      .select('name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(); // Use lean for better performance
    
    const endTime = Date.now();
    const queryTime = endTime - startTime;
    
    expect(users).toHaveLength(50);
    expect(queryTime).toBeLessThan(100); // Should complete in under 100ms
  });

  test('should use indexes for efficient queries', async () => {
    const explainResult = await User.find({ email: 'test@example.com' })
      .explain('executionStats');
    
    // Check if query used index
    expect(explainResult.executionStats.executionStages.stage).toBe('IXSCAN');
  });
});