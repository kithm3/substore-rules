const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const script = fs.readFileSync(path.join(__dirname, '../substore-mc2-override.js'), 'utf8');
const context = vm.createContext({});
vm.runInContext(script, context);
const configFor = (names) => JSON.parse(JSON.stringify(context.main({
  proxies: names.map((name) => ({ name, type: 'ss', server: 'example.com', port: 443,
    cipher: 'aes-128-gcm', password: 'test-only' })),
})));

test('SSH group defaults to DIRECT and offers valid selectable routing options', () => {
  for (const names of [['Japan 01'], ['Japan 01', 'Singapore 01']]) {
    const groups = configFor(names)['proxy-groups'];
    const ssh = groups.find((group) => group.name === 'SSH 连接');
    assert.ok(ssh, 'missing SSH group');
    assert.equal(ssh.type, 'select');
    assert.equal(ssh.proxies[0], 'DIRECT');
    for (const expected of ['选择代理', '自动选择', '故障转移', '手动选择', '日本节点']) {
      assert.ok(ssh.proxies.includes(expected), `missing SSH choice: ${expected}`);
    }
    const valid = new Set([...names, ...groups.map((group) => group.name), 'DIRECT']);
    for (const choice of ssh.proxies) assert.ok(valid.has(choice), `invalid SSH choice: ${choice}`);
  }
});

test('public TCP port 22 reaches SSH group after private bypass and before service routes', () => {
  const { rules } = configFor(['Japan 01']);
  const ssh = rules.indexOf('AND,((NETWORK,TCP),(DST-PORT,22)),SSH 连接');
  assert.ok(ssh >= 0, 'missing TCP-only port 22 SSH rule');
  for (const privateRule of ['RULE-SET,BM7_Lan,DIRECT', 'GEOSITE,private,DIRECT',
    'GEOIP,private,DIRECT,no-resolve', 'IP-CIDR,192.168.0.0/16,DIRECT,no-resolve']) {
    assert.ok(rules.indexOf(privateRule) >= 0 && rules.indexOf(privateRule) < ssh, privateRule);
  }
  for (const laterRule of ['DOMAIN,gemini.google.com,AI', 'GEOSITE,github,GitHub',
    'GEOSITE,cn,DIRECT', 'MATCH,选择代理']) {
    assert.ok(rules.indexOf(laterRule) > ssh, laterRule);
  }
  assert.ok(!rules.some((rule) => /^DST-PORT,22,/.test(rule)), 'port 22 must not capture UDP');
});
