# Sub-Store Rules

Public remote scripts for Sub-Store configuration overrides.

## Magic Catling 2

Use `substore-mc2-override.js` in a Sub-Store Mihomo/Profile/File script override step.

This script does not contain node data or private subscription URLs. Sub-Store remains responsible for fetching and updating nodes; the script only rebuilds DNS, proxy groups, and rules for Magic Catling 2.

## YYDS Lite

Use `substore-yyds-lite-override.js` in a Sub-Store Mihomo/Profile/File script override step.

This script is adapted from `666OS/YYDS` `mihomo/config/cn/Lite_cn.yaml`. It keeps Sub-Store as the source of nodes and generates the Lite DNS, policy groups, rule providers, and rules from those inline proxies.

## YYDS-MC2-V1

Use `substore-yyds-mc2-v1-override.js` in a Sub-Store Mihomo/Profile/File script override step.

This script blends the low-memory YYDS `.mrs` rule-provider layout with the existing MC2 policy groups, AI/Crypto/service routing, and a compact domestic smart-home direct bypass.
