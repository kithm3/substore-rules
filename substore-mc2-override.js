// Sub-Store remote override for Magic Catling 2 / Mihomo.
//
// Purpose:
// - Let Sub-Store continue to own node subscriptions and updates.
// - Use this remote GitHub script only to rebuild MC2-friendly DNS,
//   proxy-groups, and routing rules from the nodes Sub-Store provides.
//
// Usage:
// - Add this script in the Mihomo/Profile/File script override step.
// - Do not use it as a plain node rename script; node operation cannot
//   create proxy-groups or rules.

const GROUP = {
  SELECT: "选择代理",
  MANUAL: "手动选择",
  AUTO: "自动选择",
  FALLBACK: "故障转移",
  DIRECT: "直连",
  LOW_COST: "低倍率节点",
  LANDING: "落地节点",
  AI: "AI",
  GOOGLE: "Google",
  MICROSOFT: "Microsoft",
  TELEGRAM: "Telegram",
  YOUTUBE: "YouTube",
  NETFLIX: "Netflix",
  ONEDRIVE: "OneDrive",
  GITHUB: "GitHub",
  GLOBAL: "GLOBAL",
};

const COUNTRY_MATCHERS = [
  ["香港节点", /香港|港|HK|Hong\s*Kong/i],
  ["台湾节点", /台湾|台|TW|Taiwan/i],
  ["日本节点", /日本|东京|大阪|日|JP|Japan/i],
  ["新加坡节点", /新加坡|坡|狮城|SG|Singapore/i],
  ["美国节点", /美国|美|US|United\s*States/i],
  ["英国节点", /英国|伦敦|UK|United\s*Kingdom|London/i],
  ["德国节点", /德国|德|DE|Germany/i],
  ["法国节点", /法国|法|FR|France/i],
  ["韩国节点", /韩国|韩|KR|Korea/i],
];

const LOW_COST_RE = /0\.[0-5]|低倍率|省流|大流量|实验性/i;
const LANDING_RE = /家宽|家庭|家庭宽带|商宽|商业宽带|星链|Starlink|落地/i;

function uniq(items) {
  return [...new Set((items || []).filter(Boolean))];
}

function namesOf(proxies) {
  return (proxies || [])
    .map((proxy) => proxy && proxy.name)
    .filter(Boolean);
}

function matchNodeNames(proxies, matcher) {
  return namesOf(proxies).filter((name) => matcher.test(name));
}

function createSelect(name, proxies) {
  return { name, type: "select", proxies: uniq(proxies) };
}

function createUrlTest(name, proxies) {
  return {
    name,
    type: "url-test",
    proxies: uniq(proxies),
    url: "http://www.gstatic.com/generate_204",
    interval: 300,
    tolerance: 50,
    lazy: true,
  };
}

function createFallback(name, proxies) {
  return {
    name,
    type: "fallback",
    proxies: uniq(proxies),
    url: "http://www.gstatic.com/generate_204",
    interval: 300,
    lazy: true,
  };
}

function buildCountryGroups(proxies) {
  return COUNTRY_MATCHERS
    .map(([groupName, matcher]) => {
      const matched = matchNodeNames(proxies, matcher).filter(
        (name) => !LOW_COST_RE.test(name) && !LANDING_RE.test(name)
      );
      return matched.length > 0 ? createUrlTest(groupName, matched) : null;
    })
    .filter(Boolean);
}

function buildProxyGroups(proxies) {
  const allNodeNames = namesOf(proxies);
  const countryGroups = buildCountryGroups(proxies);
  const countryGroupNames = countryGroups.map((group) => group.name);
  const lowCostNodes = allNodeNames.filter((name) => LOW_COST_RE.test(name));
  const landingNodes = allNodeNames.filter((name) => LANDING_RE.test(name));

  const hasLowCost = lowCostNodes.length > 0;
  const hasLanding = landingNodes.length > 0;
  const regionalChoices = uniq([
    "香港节点",
    "台湾节点",
    "日本节点",
    "新加坡节点",
    "美国节点",
    ...countryGroupNames,
  ]);

  const commonChoices = uniq([
    GROUP.AUTO,
    GROUP.FALLBACK,
    hasLanding && GROUP.LANDING,
    ...regionalChoices,
    hasLowCost && GROUP.LOW_COST,
    GROUP.MANUAL,
    "DIRECT",
  ]);

  const aiChoices = uniq([
    hasLanding && GROUP.LANDING,
    GROUP.AUTO,
    "日本节点",
    "新加坡节点",
    "美国节点",
    GROUP.SELECT,
    GROUP.MANUAL,
    "DIRECT",
  ]);

  const groups = [
    createSelect(GROUP.SELECT, commonChoices),
    createSelect(GROUP.MANUAL, allNodeNames),
    createUrlTest(GROUP.AUTO, allNodeNames),
    createFallback(GROUP.FALLBACK, commonChoices.filter((name) => name !== GROUP.FALLBACK)),
    hasLanding ? createSelect(GROUP.LANDING, landingNodes) : null,
    hasLowCost ? createUrlTest(GROUP.LOW_COST, lowCostNodes) : null,
    createSelect(GROUP.AI, aiChoices),
    createSelect(GROUP.GOOGLE, [GROUP.SELECT, GROUP.AUTO, GROUP.MANUAL, "DIRECT"]),
    createSelect(GROUP.MICROSOFT, [GROUP.SELECT, GROUP.AUTO, GROUP.MANUAL, "DIRECT"]),
    createSelect(GROUP.TELEGRAM, [GROUP.SELECT, GROUP.AUTO, GROUP.MANUAL, "DIRECT"]),
    createSelect(GROUP.YOUTUBE, [GROUP.SELECT, GROUP.AUTO, GROUP.MANUAL, "DIRECT"]),
    createSelect(GROUP.NETFLIX, [GROUP.SELECT, GROUP.AUTO, GROUP.MANUAL, "DIRECT"]),
    createSelect(GROUP.ONEDRIVE, [GROUP.MICROSOFT, GROUP.SELECT, GROUP.AUTO, GROUP.MANUAL, "DIRECT"]),
    createSelect(GROUP.GITHUB, [GROUP.SELECT, GROUP.AUTO, GROUP.MANUAL, "DIRECT"]),
    ...countryGroups,
  ].filter(Boolean);

  groups.push(createSelect(GROUP.GLOBAL, groups.map((group) => group.name)));
  return groups;
}

function buildDns() {
  return {
    enable: true,
    listen: "0.0.0.0:1053",
    ipv6: false,
    "enhanced-mode": "redir-host",
    "default-nameserver": ["223.5.5.5", "119.29.29.29"],
    nameserver: [
      "system",
      "223.5.5.5",
      "119.29.29.29",
      "https://dns.alidns.com/dns-query",
      "https://doh.pub/dns-query",
    ],
    fallback: [
      "https://1.1.1.1/dns-query",
      "https://8.8.8.8/dns-query",
      "tls://1.1.1.1",
      "tls://8.8.8.8",
    ],
    "fallback-filter": {
      geoip: true,
      "geoip-code": "CN",
      geosite: ["gfw"],
    },
  };
}

function buildRules() {
  return [
    "AND,((DST-PORT,443),(NETWORK,UDP)),REJECT",
    "GEOSITE,private,DIRECT",
    "GEOIP,private,DIRECT,no-resolve",
    "DOMAIN-SUFFIX,local,DIRECT",
    "DOMAIN-SUFFIX,lan,DIRECT",
    "IP-CIDR,127.0.0.0/8,DIRECT,no-resolve",
    "IP-CIDR,10.0.0.0/8,DIRECT,no-resolve",
    "IP-CIDR,172.16.0.0/12,DIRECT,no-resolve",
    "IP-CIDR,192.168.0.0/16,DIRECT,no-resolve",
    "IP-CIDR,224.0.0.0/4,DIRECT,no-resolve",
    "DOMAIN,services.googleapis.cn,选择代理",
    "GEOSITE,category-ai-!cn,AI",
    "DOMAIN,gemini.google.com,AI",
    "DOMAIN,aistudio.google.com,AI",
    "DOMAIN,generativelanguage.googleapis.com,AI",
    "DOMAIN,copilot.microsoft.com,AI",
    "DOMAIN-SUFFIX,githubcopilot.com,AI",
    "DOMAIN-SUFFIX,openai.com,AI",
    "DOMAIN-SUFFIX,chatgpt.com,AI",
    "DOMAIN-SUFFIX,anthropic.com,AI",
    "DOMAIN-SUFFIX,claude.ai,AI",
    "DOMAIN-SUFFIX,perplexity.ai,AI",
    "DOMAIN-SUFFIX,huggingface.co,AI",
    "DOMAIN-SUFFIX,openrouter.ai,AI",
    "GEOSITE,google-play@cn,DIRECT",
    "GEOSITE,microsoft@cn,DIRECT",
    "GEOSITE,onedrive,OneDrive",
    "GEOSITE,microsoft,Microsoft",
    "GEOSITE,github,GitHub",
    "GEOSITE,telegram,Telegram",
    "GEOSITE,youtube,YouTube",
    "GEOSITE,google,Google",
    "GEOSITE,netflix,Netflix",
    "GEOIP,telegram,Telegram,no-resolve",
    "GEOIP,netflix,Netflix,no-resolve",
    "GEOSITE,gfw,选择代理",
    "GEOSITE,cn,DIRECT",
    "GEOIP,cn,DIRECT,no-resolve",
    "MATCH,选择代理",
  ];
}

function buildConfig(source) {
  const proxies = Array.isArray(source && source.proxies) ? source.proxies : [];

  return {
    port: 7890,
    "socks-port": 7891,
    "redir-port": 7892,
    "mixed-port": 7893,
    "allow-lan": true,
    "bind-address": "*",
    mode: "rule",
    "log-level": "info",
    ipv6: false,
    "external-controller": "0.0.0.0:9990",
    secret: "clash",
    dns: buildDns(),
    proxies,
    "proxy-groups": buildProxyGroups(proxies),
    rules: buildRules(),
  };
}

function main(source) {
  if (Array.isArray(source)) return source;
  return buildConfig(source || {});
}

async function operator(input) {
  if (!input || (!input.$files && input.$content == null)) return input;

  const file = input.$file || {};
  let sourceConfig = {};

  if (input.$content) {
    try {
      sourceConfig = yaml.safeLoad(input.$content) || {};
    } catch (error) {
      sourceConfig = {};
    }
  }

  if (!Array.isArray(sourceConfig.proxies) && file.sourceType !== "none" && file.sourceName) {
    sourceConfig.proxies = await produceArtifact({
      type: file.sourceType || "collection",
      name: file.sourceName,
      platform: "mihomo",
      produceType: "internal",
      produceOpts: {
        "delete-underscore-fields": true,
      },
    });
  }

  input.$content = yaml.safeDump(main(sourceConfig));
  return input;
}
