const test = require('node:test');
const assert = require('node:assert/strict');
const { app } = require('../api/server.cjs');

async function getJson(url) {
  const response = await fetch(url);
  const text = await response.text();
  let json = null;

  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }

  return { status: response.status, json, text };
}

test('health endpoint reports service status', async () => {
  const server = app.listen(0);
  await new Promise(resolve => server.once('listening', resolve));

  try {
    const port = server.address().port;
    const result = await getJson(`http://127.0.0.1:${port}/api/health`);

    assert.equal(result.status, 200);
    assert.equal(result.json.status, 'ok');
    assert.equal(result.json.service, 'MediCare AI streaming chat');
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});

test('chat endpoint rejects missing or invalid payloads', async () => {
  const server = app.listen(0);
  await new Promise(resolve => server.once('listening', resolve));

  try {
    const port = server.address().port;
    const response = await fetch(`http://127.0.0.1:${port}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [] })
    });

    assert.equal(response.status, 400);
    const json = await response.json();
    assert.match(json.error, /Please provide a message/i);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});

test('home page is served', async () => {
  const server = app.listen(0);
  await new Promise(resolve => server.once('listening', resolve));

  try {
    const port = server.address().port;
    const result = await getJson(`http://127.0.0.1:${port}/`);

    assert.equal(result.status, 200);
    assert.match(result.text, /MediCare AI/);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});
