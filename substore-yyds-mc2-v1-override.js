// Sub-Store remote override for YYDS-MC2-V1.
//
// V1 router profile:
// - Keep only small YYDS .mrs providers for high-value categories.
// - Avoid large China/Proxy provider sets; use domestic Geo fallback late.
// - Preserve the essentials from the previous MC2 profile: AI, Crypto,
//   Telegram, media groups, regional selection, and domestic smart-home bypass.

const YYDS_RULE_BASE = "https://github.com/666OS/rules/raw/release/mihomo";

const GROUP = {
  SELECT: "选择代理",
  MANUAL: "手动选择",
  AUTO: "自动选择",
  FALLBACK: "故障转移",
  LANDING: "落地节点",
  LOW_COST: "低倍率节点",
  AI: "AI",
  CRYPTO: "Crypto",
  TELEGRAM: "Telegram",
  YOUTUBE: "YouTube",
  NETFLIX: "Netflix",
  GLOBAL: "GLOBAL",
};

const COUNTRY_MATCHERS = [
  ["香港节点", /香港|港|HK|Hong\s*Kong|HongKong/i],
  ["日本节点", /日本|东京|大阪|日|JP|Japan|Tokyo|Osaka/i],
  ["新加坡节点", /新加坡|坡|狮城|SG|Singapore/i],
  ["美国节点", /美国|美|US|USA|America|United\s*States/i],
];

const LOW_COST_RE = /0\.[0-5]|低倍率|省流|大流量|实验性/i;
const LANDING_RE = /家宽|家庭|家庭宽带|商宽|商业宽带|星链|Starlink|落地/i;

const AI_SUPPLEMENT_DOMAINS = [
  "quora.com",
  "pi.ai",
  "inflection.ai",
  "you.com",
  "phind.com",
  "exa.ai",
  "arc.net",
  "thebrowser.company",
  "anysphere.co",
  "replit.com",
  "replit.dev",
  "v0.dev",
  "vercel.ai",
  "bolt.new",
  "stackblitz.com",
  "lovable.dev",
  "cody.dev",
  "continue.dev",
  "qodo.ai",
  "codium.ai",
  "aider.chat",
  "ideogram.ai",
  "krea.ai",
  "magnific.ai",
  "playground.com",
  "firefly.adobe.com",
  "runway.com",
  "luma.ai",
  "pika.art",
  "descript.com",
  "veed.io",
  "invideo.io",
  "suno.com",
  "suno.ai",
  "udio.com",
  "murf.ai",
  "resemble.ai",
  "vapi.ai",
  "assemblyai.com",
  "deepgram.com",
  "rev.ai",
  "notion.so",
  "notion.com",
  "gamma.app",
  "tome.app",
  "granola.ai",
  "fireflies.ai",
  "otter.ai",
  "tldv.io",
  "read.ai",
  "copy.ai",
  "writesonic.com",
  "grammarly.com",
  "quillbot.com",
  "deepl.com",
  "canva.com",
  "napkin.ai",
  "together.ai",
  "fireworks.ai",
  "ai21.com",
  "modal.com",
  "baseten.co",
  "fal.ai",
  "runpod.io",
  "lambda.ai",
  "databricks.com",
  "scale.com",
  "openai.azure.com",
  "cognitiveservices.azure.com",
];

const DOMESTIC_IOT_DOMAINS = [
  "simshine.cn",
  "simshine.com.cn",
  "xiaomi.com",
  "xiaomi.net",
  "mijia.tech",
  "aqara.com",
  "lumiunited.com",
  "yeelight.com",
  "yeelight.com.cn",
  "yeelink.net",
  "midea.com",
  "midea.cn",
  "midea.com.cn",
  "msmartlife.com",
  "smartmidea.net",
  "haier.com",
  "haier.net",
  "haier.cn",
  "haier.com.cn",
  "haieruplus.com",
  "haieruhome.com",
  "casarte.com",
  "lg.com",
  "lge.com",
  "lgeapi.com",
  "gongniu.cn",
  "gongniu.com.cn",
  "bull.com.cn",
  "narwal.com",
  "narwal.cn",
  "narwal.com.cn",
  "narwaltech.com",
  "narwalrobotics.com",
  "dreame.tech",
  "dreame.com",
  "dreametech.com",
  "dreamehome.com",
  "352.com",
  "352air.com",
  "352air.cn",
  "angelgroup.com.cn",
  "angelwatersolutions.com",
  "szangel.com",
  "york-iwe.com",
  "york.com",
  "johnsoncontrols.com",
  "tuya.com",
  "tuya.cn",
  "tuyacn.com",
  "smartlife.com",
  "ezviz.com",
  "ezvizlife.com",
  "hikvision.com",
  "hik-connect.com",
  "ys7.com",
  "lechange.com",
  "imoulife.com",
  "dahuasecurity.com",
  "tplinkcloud.com.cn",
  "huawei.com",
  "hicloud.com",
  "aliyun.com",
  "aliyuncs.com",
  "myqcloud.com",
  "qcloud.com",
  "tencentcloudapi.com",
  "qq.com",
  "gtimg.com",
  "jpush.cn",
  "getui.com",
  "umeng.com",
];

function uniq(items) {
  return [...new Set((items || []).filter(Boolean))];
}

function namesOf(proxies) {
  return (proxies || [])
    .map((proxy) => proxy && proxy.name)
    .filter(Boolean);
}

function matchedNames(names, matcher) {
  return names.filter((name) => matcher.test(name));
}

function withFallback(names, allNames) {
  return names.length > 0 ? names : allNames.length > 0 ? allNames : ["REJECT"];
}

function createSelect(name, proxies) {
  return { name, type: "select", proxies: uniq(proxies) };
}

function createUrlTest(name, proxies) {
  return {
    name,
    type: "url-test",
    proxies: uniq(proxies),
    url: "https://www.gstatic.com/generate_204",
    interval: 300,
    tolerance: 50,
    "empty-fallback": "REJECT",
  };
}

function createFallback(name, proxies) {
  return {
    name,
    type: "fallback",
    proxies: uniq(proxies),
    url: "https://www.gstatic.com/generate_204",
    interval: 300,
    "empty-fallback": "REJECT",
  };
}

function buildCountryGroups(proxies) {
  const all = namesOf(proxies);
  return COUNTRY_MATCHERS.map(([groupName, matcher]) => {
    const matched = matchedNames(all, matcher).filter(
      (name) => !LOW_COST_RE.test(name) && !LANDING_RE.test(name)
    );
    return matched.length > 0 ? createUrlTest(groupName, matched) : null;
  }).filter(Boolean);
}

function buildProxyGroups(proxies) {
  const all = namesOf(proxies);
  const countryGroups = buildCountryGroups(proxies);
  const countryGroupNames = countryGroups.map((group) => group.name);
  const lowCostNodes = all.filter((name) => LOW_COST_RE.test(name));
  const landingNodes = all.filter((name) => LANDING_RE.test(name));
  const hasLowCost = lowCostNodes.length > 0;
  const hasLanding = landingNodes.length > 0;
  const hasUs = countryGroupNames.includes("美国节点");
  const hasJp = countryGroupNames.includes("日本节点");
  const hasSg = countryGroupNames.includes("新加坡节点");
  const hasHk = countryGroupNames.includes("香港节点");

  const commonChoices = uniq([
    GROUP.AUTO,
    GROUP.FALLBACK,
    hasLanding && GROUP.LANDING,
    ...countryGroupNames,
    hasLowCost && GROUP.LOW_COST,
    GROUP.MANUAL,
    "DIRECT",
  ]);

  const usFirst = uniq([
    hasLanding && GROUP.LANDING,
    hasUs && "美国节点",
    GROUP.AUTO,
    hasJp && "日本节点",
    hasSg && "新加坡节点",
    GROUP.SELECT,
    GROUP.MANUAL,
    "DIRECT",
  ]);

  const sgHkFirst = uniq([
    hasSg && "新加坡节点",
    hasHk && "香港节点",
    GROUP.AUTO,
    GROUP.SELECT,
    GROUP.MANUAL,
    "DIRECT",
  ]);

  const groups = [
    createSelect(GROUP.SELECT, commonChoices),
    createSelect(GROUP.MANUAL, withFallback(all, [])),
    createUrlTest(GROUP.AUTO, withFallback(all, [])),
    createFallback(GROUP.FALLBACK, withFallback(countryGroupNames, all)),
    hasLanding ? createSelect(GROUP.LANDING, landingNodes) : null,
    hasLowCost ? createUrlTest(GROUP.LOW_COST, lowCostNodes) : null,
    createSelect(GROUP.AI, usFirst),
    createSelect(GROUP.CRYPTO, uniq([GROUP.SELECT, hasUs && "美国节点", hasJp && "日本节点", hasHk && "香港节点", GROUP.AUTO, GROUP.MANUAL, "DIRECT"])),
    createSelect(GROUP.TELEGRAM, sgHkFirst),
    createSelect(GROUP.YOUTUBE, uniq([GROUP.SELECT, hasUs && "美国节点", hasJp && "日本节点", GROUP.AUTO, GROUP.MANUAL, "DIRECT"])),
    createSelect(GROUP.NETFLIX, uniq([GROUP.SELECT, hasUs && "美国节点", hasJp && "日本节点", hasSg && "新加坡节点", GROUP.AUTO, GROUP.MANUAL, "DIRECT"])),
    ...countryGroups,
  ].filter(Boolean);

  groups.push(createSelect(GROUP.GLOBAL, groups.map((group) => group.name)));
  return groups;
}

function domainProvider(name) {
  return {
    type: "http",
    behavior: "domain",
    format: "mrs",
    interval: 86400,
    url: `${YYDS_RULE_BASE}/domain/${name}.mrs`,
  };
}

function ipProvider(name) {
  return {
    type: "http",
    behavior: "ipcidr",
    format: "mrs",
    interval: 86400,
    url: `${YYDS_RULE_BASE}/ip/${name}.mrs`,
  };
}

function buildRuleProviders() {
  return {
    Private: domainProvider("Private"),
    PrivateIP: ipProvider("Private"),
    AI: domainProvider("AI"),
    Crypto: domainProvider("Crypto"),
    Telegram: domainProvider("Telegram"),
    TelegramIP: ipProvider("Telegram"),
    YouTube: domainProvider("YouTube"),
    Netflix: domainProvider("Netflix"),
    NetflixIP: ipProvider("Netflix"),
  };
}

function buildDns() {
  return {
    enable: true,
    ipv6: false,
    "enhanced-mode": "fake-ip",
    "fake-ip-range": "198.18.0.1/16",
    "default-nameserver": ["119.29.29.29", "180.184.1.1", "223.5.5.5"],
    nameserver: ["https://dns.alidns.com/dns-query", "https://doh.pub/dns-query"],
    "fake-ip-filter": [
      "+.lan",
      "+.local",
      "+.miwifi.com",
      "+.docker.io",
      "+.market.xiaomi.com",
      "+.push.apple.com",
      "Mijia Cloud",
    ],
  };
}

function buildRules() {
  const domainSuffixRules = (domains, group) =>
    uniq(domains).map((domain) => `DOMAIN-SUFFIX,${domain},${group}`);

  return [
    "RULE-SET,Private,DIRECT",
    "RULE-SET,PrivateIP,DIRECT,no-resolve",
    "DOMAIN-SUFFIX,local,DIRECT",
    "DOMAIN-SUFFIX,lan,DIRECT",
    "IP-CIDR,127.0.0.0/8,DIRECT,no-resolve",
    "IP-CIDR,10.0.0.0/8,DIRECT,no-resolve",
    "IP-CIDR,172.16.0.0/12,DIRECT,no-resolve",
    "IP-CIDR,192.168.0.0/16,DIRECT,no-resolve",
    "IP-CIDR,224.0.0.0/4,DIRECT,no-resolve",
    ...domainSuffixRules(DOMESTIC_IOT_DOMAINS, "DIRECT"),
    "DST-PORT,123,DIRECT",
    "DST-PORT,1883,DIRECT",
    "DST-PORT,8883,DIRECT",
    "DOMAIN,services.googleapis.cn,DIRECT",
    ...domainSuffixRules(AI_SUPPLEMENT_DOMAINS, GROUP.AI),
    "RULE-SET,AI,AI",
    "RULE-SET,Crypto,Crypto",
    "RULE-SET,Telegram,Telegram",
    "RULE-SET,TelegramIP,Telegram,no-resolve",
    "RULE-SET,YouTube,YouTube",
    "RULE-SET,Netflix,Netflix",
    "RULE-SET,NetflixIP,Netflix,no-resolve",
    "GEOSITE,google-play@cn,DIRECT",
    "GEOSITE,microsoft@cn,DIRECT",
    "GEOSITE,cn,DIRECT",
    "GEOIP,cn,DIRECT,no-resolve",
    "MATCH,选择代理",
  ];
}

function buildConfig(source) {
  const proxies = Array.isArray(source && source.proxies) ? source.proxies : [];

  return {
    mode: "rule",
    port: 7890,
    "socks-port": 7891,
    "redir-port": 7892,
    "mixed-port": 7893,
    "tproxy-port": 7895,
    ipv6: false,
    "allow-lan": true,
    "unified-delay": true,
    "tcp-concurrent": true,
    "log-level": "silent",
    "bind-address": "*",
    "find-process-mode": "always",
    "keep-alive-interval": 15,
    "keep-alive-idle": 600,
    experimental: { "quic-go-disable-gso": true },
    "external-controller": "0.0.0.0:9990",
    secret: "clash",
    profile: { "store-selected": true, "store-fake-ip": true },
    sniffer: {
      enable: true,
      sniff: {
        HTTP: { ports: [80, "8080-8880"], "override-destination": true },
        TLS: { ports: [443, 8443] },
        QUIC: { ports: [443, 8443] },
      },
      "skip-domain": ["Mijia Cloud", "+.push.apple.com"],
    },
    tun: {
      enable: false,
      stack: "mixed",
      "dns-hijack": ["any:53", "tcp://any:53"],
      "auto-route": true,
      "auto-redirect": true,
      "auto-detect-interface": true,
    },
    dns: buildDns(),
    proxies,
    "proxy-groups": buildProxyGroups(proxies),
    "rule-providers": buildRuleProviders(),
    rules: buildRules(),
  };
}

function main(source) {
  if (Array.isArray(source)) return source;
  return buildConfig(source || {});
}
