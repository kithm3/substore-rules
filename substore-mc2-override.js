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
  CRYPTO: "Crypto",
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

const AI_CHAT_DOMAINS = [
  "openai.com",
  "chatgpt.com",
  "oaistatic.com",
  "oaiusercontent.com",
  "sora.com",
  "anthropic.com",
  "claude.ai",
  "x.ai",
  "grok.com",
  "meta.ai",
  "character.ai",
  "poe.com",
  "quora.com",
  "pi.ai",
  "inflection.ai",
];

const AI_SEARCH_DOMAINS = [
  "perplexity.ai",
  "pplx.ai",
  "you.com",
  "phind.com",
  "exa.ai",
  "arc.net",
  "thebrowser.company",
];

const AI_CODE_DOMAINS = [
  "cursor.com",
  "cursor.sh",
  "cursorapi.com",
  "anysphere.co",
  "windsurf.com",
  "codeium.com",
  "codeiumdata.com",
  "githubcopilot.com",
  "copilot-proxy.githubusercontent.com",
  "copilot-telemetry.githubusercontent.com",
  "tabnine.com",
  "replit.com",
  "replit.dev",
  "v0.dev",
  "vercel.ai",
  "bolt.new",
  "stackblitz.com",
  "lovable.dev",
  "sourcegraph.com",
  "cody.dev",
  "continue.dev",
  "qodo.ai",
  "codium.ai",
  "kiro.dev",
  "aider.chat",
];

const AI_IMAGE_DOMAINS = [
  "midjourney.com",
  "stability.ai",
  "clipdrop.co",
  "leonardo.ai",
  "ideogram.ai",
  "krea.ai",
  "magnific.ai",
  "playground.com",
  "firefly.adobe.com",
  "labs.google",
];

const AI_VIDEO_DOMAINS = [
  "runwayml.com",
  "runway.com",
  "luma.ai",
  "pika.art",
  "heygen.com",
  "synthesia.io",
  "descript.com",
  "veed.io",
  "invideo.io",
];

const AI_AUDIO_DOMAINS = [
  "elevenlabs.io",
  "suno.com",
  "suno.ai",
  "udio.com",
  "murf.ai",
  "resemble.ai",
  "vapi.ai",
  "assemblyai.com",
  "deepgram.com",
  "rev.ai",
];

const AI_PRODUCTIVITY_DOMAINS = [
  "notion.so",
  "notion.com",
  "gamma.app",
  "tome.app",
  "granola.ai",
  "fireflies.ai",
  "otter.ai",
  "tldv.io",
  "read.ai",
  "jasper.ai",
  "copy.ai",
  "writesonic.com",
  "grammarly.com",
  "quillbot.com",
  "deepl.com",
  "canva.com",
  "napkin.ai",
];

const AI_PLATFORM_DOMAINS = [
  "huggingface.co",
  "hf.co",
  "replicate.com",
  "together.ai",
  "groq.com",
  "fireworks.ai",
  "openrouter.ai",
  "mistral.ai",
  "cohere.com",
  "ai21.com",
  "modal.com",
  "baseten.co",
  "fal.ai",
  "cerebras.ai",
  "runpod.io",
  "lambda.ai",
  "databricks.com",
  "scale.com",
];

const CRYPTO_DOMAINS = [
  "coinbase.com",
  "coinbase.com",
  "coinbasecloud.dev",
  "binance.com",
  "binance.us",
  "kraken.com",
  "crypto.com",
  "okx.com",
  "bybit.com",
  "kucoin.com",
  "gate.io",
  "bitget.com",
  "bitstamp.net",
  "gemini.com",
  "mexc.com",
  "bitfinex.com",
  "robinhood.com",
  "etoro.com",
  "uniswap.org",
  "metamask.io",
  "walletconnect.com",
  "opensea.io",
  "magiceden.io",
  "blur.io",
  "etherscan.io",
  "bscscan.com",
  "polygonscan.com",
  "arbiscan.io",
  "basescan.org",
  "solscan.io",
  "defillama.com",
  "coingecko.com",
  "coinmarketcap.com",
  "tradingview.com",
  "chain.link",
  "aave.com",
  "compound.finance",
  "makerdao.com",
  "lido.fi",
  "curve.fi",
  "1inch.io",
  "dydx.exchange",
  "pump.fun",
];

const BLACKMATRIX7_RULE_PROVIDERS = {
  BM7_Lan: {
    type: "http",
    behavior: "classical",
    format: "text",
    interval: 86400,
    url: "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Lan/Lan.list",
    path: "./ruleset/blackmatrix7/Lan.list",
  },
  BM7_XiaoMi: {
    type: "http",
    behavior: "classical",
    format: "text",
    interval: 86400,
    url: "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/XiaoMi/XiaoMi.list",
    path: "./ruleset/blackmatrix7/XiaoMi.list",
  },
  BM7_LvMiLianChuang: {
    type: "http",
    behavior: "classical",
    format: "text",
    interval: 86400,
    url: "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/LvMiLianChuang/LvMiLianChuang.list",
    path: "./ruleset/blackmatrix7/LvMiLianChuang.list",
  },
  BM7_LG: {
    type: "http",
    behavior: "classical",
    format: "text",
    interval: 86400,
    url: "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/LG/LG.list",
    path: "./ruleset/blackmatrix7/LG.list",
  },
};

const DOMESTIC_IOT_DOMAINS = [
  // 海马爸比 / 星巡智能
  "simshine.cn",
  "simshine.com.cn",
  "simshine.com",
  // 小米 / 米家 / Aqara / 易来 Yeelight
  "mi.com",
  "mi.cn",
  "miui.com",
  "xiaomi.com",
  "xiaomi.net",
  "mijia.tech",
  "io.mi.com",
  "home.mi.com",
  "home.miui.com",
  "aqara.com",
  "lumiunited.com",
  "yeelight.com",
  "yeelight.com.cn",
  "yeelink.net",
  // 美的 / 美居 / Midea IoT
  "asi-midea.com",
  "midea-buy.com",
  "midea-group.com",
  "midea-hotwater.com",
  "midea.com",
  "midea.cn",
  "midea.com.cn",
  "midea.net",
  "midea.com.tr",
  "mideabiomedical.com",
  "mideadc.com",
  "mideaepay.com",
  "mideaepayuat.com",
  "mideav.com",
  "mideazy.com",
  "msmart.midea.com",
  "msmartlife.com",
  "smartmidea.net",
  "midea.com.hk",
  "iot.midea.com",
  // 海尔 / 海尔智家 / U+
  "ehaier.com",
  "haier-ioc.com",
  "haier.com",
  "haier.net",
  "haier.cn",
  "haier.com.cn",
  "haier.hk",
  "haiercash.com",
  "haierfinancial.com",
  "haiermoney.com",
  "haiershequ.com",
  "haiershui.com",
  "haiersmarthomes.com",
  "haierubic.com",
  "haieruplus.com",
  "ihaier.com",
  "pohaier.com",
  "smart-home.haier.com",
  "uhome.haier.net",
  "haieruhome.com",
  "haieruplus.com",
  "casarte.com",
  "geappliances.com",
  // LG ThinQ
  "lg.com",
  "lge.com",
  "lgeapi.com",
  "lgtvcommon.com",
  "smartsolution.developer.lge.com",
  // 公牛
  "gongniu.cn",
  "gongniu.com.cn",
  "bull.com.cn",
  // 云鲸 Narwal
  "narwal.com",
  "narwal.cn",
  "narwal.com.cn",
  "narwaltech.com",
  "narwalrobotics.com",
  "narwal-general-public.oss-cn-shenzhen.aliyuncs.com",
  // 追觅 Dreame
  "dreame.tech",
  "dreame.com",
  "dreametech.com",
  "dreamehome.com",
  "dreamershop.com",
  "ecodreamers.com",
  "pdreamer.com",
  "todreamer.com",
  "app.dreame.tech",
  "mall.dreame.tech",
  "dcr.dreame.tech",
  // 352
  "352.com",
  "352air.com",
  "352air.cn",
  // 安吉尔
  "angelgroup.com.cn",
  "angelwatersolutions.com",
  "szangel.com",
  "angel-sh.com",
  // 约克 IWE / Johnson Controls
  "york-iwe.com",
  "york.com",
  "johnsoncontrols.com",
  // 涂鸦 / Smart Life
  "tuya.com",
  "tuya.cn",
  "tuyacn.com",
  "tuyaus.com",
  "tuyaeu.com",
  "gaituya.com",
  "tuyansuo.com",
  "tuyaya.com",
  "weituya.com",
  "smartlife.com",
  "smart321.com",
  // 摄像头 / 安防 / 路由与智能硬件
  "ezviz.com",
  "ezvizlife.com",
  "hikvision.com",
  "hik-connect.com",
  "ys7.com",
  "lechange.com",
  "imoulife.com",
  "dahuasecurity.com",
  "tp-link.com.cn",
  "tplinkcloud.com.cn",
  "mercusys.com.cn",
  "tenda.com.cn",
  "huawei.com",
  "hicloud.com",
  "vmall.com",
  "honor.com",
  "360.cn",
  "360.com",
  // 国内云、推送、P2P 和常见基础服务
  "aliyun.com",
  "aliyuncs.com",
  "alicdn.com",
  "myqcloud.com",
  "qcloud.com",
  "tencentcloudapi.com",
  "qcloudcdn.com",
  "bdstatic.com",
  "baidu.com",
  "qq.com",
  "gtimg.com",
  "jpush.cn",
  "getui.com",
  "umeng.com",
  "oray.com",
  "oray.net",
  "nat123.com",
];

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
    "美国节点",
    GROUP.AUTO,
    "日本节点",
    "新加坡节点",
    GROUP.SELECT,
    GROUP.MANUAL,
    "DIRECT",
  ]);

  const cryptoChoices = uniq([
    GROUP.SELECT,
    GROUP.AUTO,
    "美国节点",
    "日本节点",
    "香港节点",
    "新加坡节点",
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
    createSelect(GROUP.CRYPTO, cryptoChoices),
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
  const domainSuffixRules = (domains, group) =>
    uniq(domains).map((domain) => `DOMAIN-SUFFIX,${domain},${group}`);

  const exactRules = [
    "DOMAIN,gemini.google.com,AI",
    "DOMAIN,aistudio.google.com,AI",
    "DOMAIN,makersuite.google.com,AI",
    "DOMAIN,notebooklm.google.com,AI",
    "DOMAIN,ai.google.dev,AI",
    "DOMAIN,generativelanguage.googleapis.com,AI",
    "DOMAIN,copilot.microsoft.com,AI",
    "DOMAIN,copilot.cloud.microsoft,AI",
    "DOMAIN,copilotstudio.microsoft.com,AI",
    "DOMAIN,ai.azure.com,AI",
  ];

  return [
    "RULE-SET,BM7_Lan,DIRECT",
    "RULE-SET,BM7_XiaoMi,DIRECT",
    "RULE-SET,BM7_LvMiLianChuang,DIRECT",
    "RULE-SET,BM7_LG,DIRECT",
    "GEOSITE,private,DIRECT",
    "GEOIP,private,DIRECT,no-resolve",
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
    ...exactRules,
    ...domainSuffixRules(AI_CHAT_DOMAINS, GROUP.AI),
    ...domainSuffixRules(AI_SEARCH_DOMAINS, GROUP.AI),
    ...domainSuffixRules(AI_CODE_DOMAINS, GROUP.AI),
    ...domainSuffixRules(AI_IMAGE_DOMAINS, GROUP.AI),
    ...domainSuffixRules(AI_VIDEO_DOMAINS, GROUP.AI),
    ...domainSuffixRules(AI_AUDIO_DOMAINS, GROUP.AI),
    ...domainSuffixRules(AI_PRODUCTIVITY_DOMAINS, GROUP.AI),
    ...domainSuffixRules(AI_PLATFORM_DOMAINS, GROUP.AI),
    "DOMAIN-SUFFIX,openai.azure.com,AI",
    "DOMAIN-SUFFIX,cognitiveservices.azure.com,AI",
    "GEOSITE,category-ai-!cn,AI",
    ...domainSuffixRules(CRYPTO_DOMAINS, GROUP.CRYPTO),
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
    "DOMAIN-SUFFIX,cn,DIRECT",
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
    "rule-providers": BLACKMATRIX7_RULE_PROVIDERS,
    rules: buildRules(),
  };
}

function main(source) {
  if (Array.isArray(source)) return source;
  return buildConfig(source || {});
}
