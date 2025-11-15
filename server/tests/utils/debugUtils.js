// tests/utils/debugUtils.js
class DatabaseDebugger {
  static async logCollectionStats(collectionName) {
    const stats = await mongoose.connection.db.collection(collectionName).stats();
    console.log(`\n--- ${collectionName} Stats ---`);
    console.log(`Documents: ${stats.count}`);
    console.log(`Size: ${stats.size} bytes`);
    console.log(`Indexes: ${stats.nindexes}`);
  }

  static async logSlowQueries() {
    // Enable profiling in test environment
    await mongoose.connection.db.profiling({ mode: 'slowOp', slowOpThresholdMs: 100 });
    
    const slowQueries = await mongoose.connection.db.collection('system.profile').find({}).toArray();
    console.log('\n--- Slow Queries ---');
    slowQueries.forEach(query => {
      console.log(`Operation: ${query.op}, Duration: ${query.millis}ms`);
    });
  }

  static async explainQuery(query) {
    const explanation = await query.explain('executionStats');
    console.log('\n--- Query Explanation ---');
    console.log('Execution Stats:', explanation.executionStats);
    return explanation;
  }
}

module.exports = DatabaseDebugger;