// Sub-Store remote override for a YYDS Lite-style Mihomo profile.
//
// Source profile:
// - https://github.com/666OS/YYDS/tree/main/mihomo/config
// - Based on cn/Lite_cn.yaml v2.0.0 (2026-05-25)
//
// Purpose:
// - Let Sub-Store own node subscriptions and updates.
// - Use this script to rebuild a complete Lite Mihomo config from
//   Sub-Store-provided inline proxies.

const FILTER = {
  HK: /港|hk|hong\s*kong|hongkong/i,
  TW: /台|tw|taiwan|taipei/i,
  JP: /日|jp|japan|tokyo|osaka/i,
  SG: /新|坡|狮城|sg|singapore/i,
  KR: /韩|kr|korea|seoul/i,
  US: /美|us|usa|america|united\s*states/i,
};

const GROUPS = {
  IM: "即时通讯",
  SOCIAL: "社交平台",
  AI: "人工智能",
  DEV: "开发服务",
  STREAMING: "国际媒体",
  APPLE: "苹果服务",
  PROXY: "国外流量",
  DIRECT: "国内流量",
  FINAL: "漏网之鱼",
  FALLBACK: "故障转移",
  MANUAL: "全球手动",
  HK: "香港策略",
  TW: "台湾策略",
  JP: "日本策略",
  SG: "狮城策略",
  KR: "韩国策略",
  US: "美国策略",
};

const ICON = {
  IM: "https://github.com/Koolson/Qure/raw/master/IconSet/Color/Telegram_X.png",
  SOCIAL: "https://github.com/Koolson/Qure/raw/master/IconSet/Color/Twitter.png",
  AI: "https://github.com/Koolson/Qure/raw/master/IconSet/Color/AI.png",
  DEV: "https://github.com/Koolson/Qure/raw/master/IconSet/Color/GitHub.png",
  STREAMING: "https://github.com/Koolson/Qure/raw/master/IconSet/Color/Streaming.png",
  APPLE: "https://github.com/Koolson/Qure/raw/master/IconSet/Color/Apple_1.png",
  PROXY: "https://github.com/Koolson/Qure/raw/master/IconSet/Color/Global.png",
  DIRECT: "https://github.com/Koolson/Qure/raw/master/IconSet/Color/China.png",
  FINAL: "https://github.com/Koolson/Qure/raw/master/IconSet/Color/Final.png",
  FALLBACK: "https://github.com/Koolson/Qure/raw/master/IconSet/Color/ULB.png",
  MANUAL: "https://github.com/Koolson/Qure/raw/master/IconSet/Color/Clubhouse.png",
  HK: "https://github.com/Koolson/Qure/raw/master/IconSet/Color/Hong_Kong.png",
  TW: "https://github.com/Koolson/Qure/raw/master/IconSet/Color/Taiwan.png",
  JP: "https://github.com/Koolson/Qure/raw/master/IconSet/Color/Japan.png",
  SG: "https://github.com/Koolson/Qure/raw/master/IconSet/Color/Singapore.png",
  KR: "https://github.com/Koolson/Qure/raw/master/IconSet/Color/Korea.png",
  US: "https://github.com/Koolson/Qure/raw/master/IconSet/Color/United_States.png",
};

const YYDS_RULE_BASE = "https://github.com/666OS/rules/raw/release/mihomo";

function uniq(items) {
  return [...new Set((items || []).filter(Boolean))];
}

function proxyNames(proxies) {
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

function selectGroup(name, proxies, icon) {
  return { name, type: "select", proxies: uniq(proxies), icon };
}

function urlTestGroup(name, proxies, icon) {
  return {
    name,
    type: "url-test",
    proxies: uniq(proxies),
    url: "https://www.gstatic.com/generate_204",
    interval: 300,
    "empty-fallback": "REJECT",
    tolerance: 50,
    icon,
  };
}

function fallbackGroup(name, proxies, icon) {
  return {
    name,
    type: "fallback",
    proxies: uniq(proxies),
    url: "https://www.gstatic.com/generate_204",
    interval: 300,
    "empty-fallback": "REJECT",
    icon,
  };
}

function buildPolicyGroups(proxies) {
  const all = proxyNames(proxies);
  const hk = withFallback(matchedNames(all, FILTER.HK), all);
  const tw = withFallback(matchedNames(all, FILTER.TW), all);
  const jp = withFallback(matchedNames(all, FILTER.JP), all);
  const sg = withFallback(matchedNames(all, FILTER.SG), all);
  const kr = withFallback(matchedNames(all, FILTER.KR), all);
  const us = withFallback(matchedNames(all, FILTER.US), all);

  const oversea = [
    GROUPS.FALLBACK,
    GROUPS.MANUAL,
    GROUPS.HK,
    GROUPS.TW,
    GROUPS.JP,
    GROUPS.SG,
    GROUPS.KR,
    GROUPS.US,
    "DIRECT",
  ];
  const direct = [
    "DIRECT",
    GROUPS.FALLBACK,
    GROUPS.MANUAL,
    GROUPS.HK,
    GROUPS.TW,
    GROUPS.JP,
    GROUPS.SG,
    GROUPS.KR,
    GROUPS.US,
  ];
  const usFirst = [
    GROUPS.US,
    GROUPS.FALLBACK,
    GROUPS.MANUAL,
    GROUPS.HK,
    GROUPS.TW,
    GROUPS.JP,
    GROUPS.SG,
    GROUPS.KR,
  ];
  const sgFirst = [
    GROUPS.SG,
    GROUPS.FALLBACK,
    GROUPS.MANUAL,
    GROUPS.HK,
    GROUPS.TW,
    GROUPS.JP,
    GROUPS.KR,
    GROUPS.US,
  ];

  return [
    selectGroup(GROUPS.IM, sgFirst, ICON.IM),
    selectGroup(GROUPS.SOCIAL, usFirst, ICON.SOCIAL),
    selectGroup(GROUPS.AI, usFirst, ICON.AI),
    selectGroup(GROUPS.DEV, usFirst, ICON.DEV),
    selectGroup(GROUPS.STREAMING, usFirst, ICON.STREAMING),
    selectGroup(GROUPS.APPLE, usFirst, ICON.APPLE),
    selectGroup(GROUPS.PROXY, oversea, ICON.PROXY),
    selectGroup(GROUPS.DIRECT, direct, ICON.DIRECT),
    selectGroup(GROUPS.FINAL, oversea, ICON.FINAL),
    fallbackGroup(
      GROUPS.FALLBACK,
      [GROUPS.US, GROUPS.JP, GROUPS.SG, GROUPS.KR, GROUPS.HK, GROUPS.TW],
      ICON.FALLBACK
    ),
    selectGroup(GROUPS.MANUAL, withFallback(all, []), ICON.MANUAL),
    urlTestGroup(GROUPS.HK, hk, ICON.HK),
    urlTestGroup(GROUPS.TW, tw, ICON.TW),
    urlTestGroup(GROUPS.JP, jp, ICON.JP),
    urlTestGroup(GROUPS.SG, sg, ICON.SG),
    urlTestGroup(GROUPS.KR, kr, ICON.KR),
    urlTestGroup(GROUPS.US, us, ICON.US),
  ];
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
    Apple: domainProvider("Apple"),
    Telegram: domainProvider("Telegram"),
    TM: domainProvider("TM"),
    SocialMedia: domainProvider("SocialMedia"),
    AI: domainProvider("AI"),
    Dev: domainProvider("Dev"),
    YouTube: domainProvider("YouTube"),
    Netflix: domainProvider("Netflix"),
    Spotify: domainProvider("Spotify"),
    Disney: domainProvider("Disney"),
    Streaming: domainProvider("Streaming"),
    Proxy: domainProvider("Proxy"),
    China: domainProvider("China"),
    PrivateIP: ipProvider("Private"),
    TelegramIP: ipProvider("Telegram"),
    SocialMediaIP: ipProvider("SocialMedia"),
    AIIP: ipProvider("AI"),
    NetflixIP: ipProvider("Netflix"),
    StreamingIP: ipProvider("Streaming"),
    ProxyIP: ipProvider("Proxy"),
    ChinaIP: ipProvider("China"),
  };
}

function buildRules() {
  return [
    "RULE-SET,Private,DIRECT",
    "RULE-SET,PrivateIP,DIRECT,no-resolve",
    "RULE-SET,TM,即时通讯",
    "RULE-SET,Telegram,即时通讯",
    "RULE-SET,TelegramIP,即时通讯,no-resolve",
    "RULE-SET,SocialMedia,社交平台",
    "RULE-SET,SocialMediaIP,社交平台,no-resolve",
    "RULE-SET,AI,人工智能",
    "RULE-SET,AIIP,人工智能,no-resolve",
    "RULE-SET,Dev,开发服务",
    "RULE-SET,Streaming,国际媒体",
    "RULE-SET,StreamingIP,国际媒体,no-resolve",
    "RULE-SET,Apple,苹果服务",
    "RULE-SET,Proxy,国外流量",
    "RULE-SET,ProxyIP,国外流量,no-resolve",
    "RULE-SET,China,国内流量",
    "RULE-SET,ChinaIP,国内流量,no-resolve",
    "MATCH,漏网之鱼",
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
    "allow-lan": false,
    "unified-delay": true,
    "tcp-concurrent": true,
    "log-level": "silent",
    "bind-address": "*",
    "find-process-mode": "always",
    "keep-alive-interval": 15,
    "keep-alive-idle": 600,
    authentication: ["mihomo:yyds666"],
    "skip-auth-prefixes": ["127.0.0.1/8", "::1/128"],
    experimental: { "quic-go-disable-gso": true },
    "external-ui-url": "https://github.com/Zephyruso/zashboard/releases/latest/download/dist.zip",
    "external-ui-name": "zashboard",
    "external-ui": "ui",
    "external-controller": "127.0.0.1:9090",
    secret: "yyds666",
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
    dns: {
      enable: true,
      ipv6: false,
      "enhanced-mode": "fake-ip",
      "fake-ip-range": "198.18.0.1/16",
      "default-nameserver": ["119.29.29.29", "180.184.1.1", "223.5.5.5"],
      nameserver: ["https://dns.alidns.com/dns-query", "https://doh.pub/dns-query"],
      "fake-ip-filter": ["+.miwifi.com", "+.docker.io", "+.market.xiaomi.com", "+.push.apple.com"],
    },
    proxies,
    "proxy-groups": buildPolicyGroups(proxies),
    "rule-providers": buildRuleProviders(),
    rules: buildRules(),
  };
}

function main(source) {
  if (Array.isArray(source)) return source;
  return buildConfig(source || {});
}
