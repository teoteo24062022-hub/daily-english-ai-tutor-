import assert from 'node:assert';
import test, { before, after } from 'node:test';
import { startServer, stopServer } from '../server.js';

before(async () => {
  await startServer(3000);
});

after(async () => {
  await stopServer();
});

test('GET /api/config returns hasEnvKey and activeModel', async () => {
  const res = await fetch('http://localhost:3000/api/config');
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(typeof data.hasEnvKey, 'boolean');
  assert.strictEqual(typeof data.activeModel, 'string');
});

test('POST /api/config allows updating client key in runtime memory', async () => {
  const res = await fetch('http://localhost:3000/api/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey: 'test_key_12345' })
  });
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.success, true);

  // Check that hasEnvKey is now true
  const checkRes = await fetch('http://localhost:3000/api/config');
  const checkData = await checkRes.json();
  assert.strictEqual(checkData.hasEnvKey, true);
});
