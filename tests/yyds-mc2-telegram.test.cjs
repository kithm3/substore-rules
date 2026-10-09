const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const script = fs.readFileSync(path.join(__dirname, '../substore-yyds-mc2-v1-override.js'), 'utf8');
const context = vm.createContext({});
vm.runInContext(script, context);
const configFor = (names) => JSON.parse(JSON.stringify(context.main({
  proxies: names.map((name) => ({ name, type: 'ss', server: 'example.com', port: 443,
    cipher: 'aes-128-gcm', password: 'test-only' })),
})));

const officialCidrs = [
  '91.108.56.0/22', '91.108.4.0/22', '91.108.8.0/22', '91.108.16.0/22',
  '91.108.12.0/22', '149.154.160.0/20', '91.105.192.0/23', '91.108.20.0/22',
  '185.76.151.0/24', '2001:b28:f23d::/48', '2001:b28:f23f::/48',
  '2001:67c:4e8::/48', '2001:b28:f23c::/48', '2a0a:f280::/32',
];

test('official Telegram networks route without a remote provider, before broad bypasses', () => {
  const { rules } = configFor(['Singapore 01']);
  const bypass = rules.indexOf('DOMAIN-SUFFIX,aliyuncs.com,DIRECT');
  for (const cidr of officialCidrs) {
    const type = cidr.includes(':') ? 'IP-CIDR6' : 'IP-CIDR';
    const position = rules.indexOf(`${type},${cidr},Telegram,no-resolve`);
    assert.ok(position >= 0 && position < bypass, `missing or late Telegram rule: ${cidr}`);
  }
});

test('core Telegram domains route without remote providers', () => {
  const { rules } = configFor(['Japan 01']);
  for (const host of ['api.telegram.org', 't.me', 'web.telegram.org',
    'cdn.telegram-cdn.org', 'cdn.cdn-telegram.org', 'telegra.ph',
    'telegramdownload.com', 'updates.tdesktop.com', 'telesco.pe', 'tg.dev']) {
    const match = rules.find((rule) => {
      const [type, domain] = rule.split(',');
      return type === 'DOMAIN-SUFFIX' && (host === domain || host.endsWith(`.${domain}`));
    });
    assert.ok(match && match.endsWith(',Telegram'), `missing Telegram route: ${host}`);
    assert.ok(rules.indexOf(match) < rules.indexOf('RULE-SET,Telegram,Telegram'));
  }
});

test('sparse subscriptions keep valid, nonempty groups without changing provider count', () => {
  for (const names of [['Singapore 01'], ['Japan 01', 'US 01'], []]) {
    const config = configFor(names);
    const groups = config['proxy-groups'];
    const valid = new Set([...names, ...groups.map((g) => g.name), 'DIRECT', 'REJECT']);
    for (const group of groups) {
      assert.ok(group.proxies.length > 0, `empty group: ${group.name}`);
      for (const item of group.proxies) assert.ok(valid.has(item), `missing reference: ${item}`);
    }
    assert.equal(Object.keys(config['rule-providers']).length, 9);
    assert.ok(config.rules.includes('RULE-SET,TelegramIP,Telegram,no-resolve'));
  }
});

test('domestic IoT bypass and low-memory baseline remain intact', () => {
  const config = configFor(['Singapore 01']);
  for (const domain of ['simshine.cn', 'yeelight.com', 'midea.com', 'haier.com', 'dreame.tech']) {
    assert.ok(config.rules.includes(`DOMAIN-SUFFIX,${domain},DIRECT`));
  }
  assert.equal(config.rules.at(-1), 'MATCH,选择代理');
  assert.equal(config.dns['enhanced-mode'], 'fake-ip');
  assert.equal(config.ipv6, false);
});
