/**
 * Qoder API constants ported from CLIProxyAPIPlus qoder-provider branch.
 *
 * Qoder ships two independent editions with separate accounts/quotas:
 *   intl — qoder.com / *.qoder.sh   (global)
 *   cn   — qoder.com.cn             (China edition)
 * Verified 2026-08-20:
 *   - qoder.com.cn/device/selectAccounts exists (redirects to CN sign-in)
 *   - openapi.qoder.com.cn/api/v1/deviceToken/poll returns 404 while pending,
 *     same semantics as the intl poll endpoint
 *   - gateway.qoder.com.cn/algo/api/v2/model/list answers 403 unauthenticated
 *     (endpoint exists, needs COSY-signed auth)
 *   - api2.qoder.com.cn resolves but does not serve HTTPS, so CN job-token
 *     (jt-...) traffic stays on the gateway host
 *   - center.qoder.com.cn does not resolve; refresh is a no-op for device
 *     tokens anyway (upstream returns 403 for our flow)
 *
 * Endpoint set (intl):
 *   openapi.qoder.sh   - device flow + userinfo + quota usage
 *   center.qoder.sh    - token refresh (best-effort, currently 403 for device tokens)
 *   api3.qoder.sh      - inference (chat) + model list, requires COSY signing
 *   qoder.com/device   - browser landing page for device authorization
 */

// Per-region endpoint table. `chatBaseAlt` is where job-token (jt-...) traffic
// must go — api3 rejects jt- with "Login expired" (403) and the official
// qodercli serves it from api2 instead. CN has no reachable api2 equivalent,
// so it reuses the gateway host.
export const QODER_ENDPOINTS = {
  intl: {
    openapiBase: "https://openapi.qoder.sh",
    centerBase: "https://center.qoder.sh",
    chatBase: "https://api3.qoder.sh",
    chatBaseAlt: "https://api2.qoder.sh",
    loginUrl: "https://qoder.com/device/selectAccounts",
  },
  cn: {
    openapiBase: "https://openapi.qoder.com.cn",
    centerBase: "https://center.qoder.com.cn",
    chatBase: "https://gateway.qoder.com.cn",
    chatBaseAlt: "https://gateway.qoder.com.cn",
    loginUrl: "https://qoder.com.cn/device/selectAccounts",
  },
};

/**
 * Normalize a provider id ("qoder" / "qoder-cn") or region hint ("intl"/"cn")
 * into a region key of QODER_ENDPOINTS. Unknown input falls back to intl so
 * legacy callers (no provider on the credential) keep their old behavior.
 */
export function resolveQoderRegion(hint) {
  if (typeof hint !== "string") return "intl";
  const h = hint.toLowerCase();
  if (h === "cn" || h === "qoder-cn" || h.endsWith("-cn")) return "cn";
  return "intl";
}

/**
 * Derive the full endpoint set for one API path style. Returns concrete URLs
 * (not bases) for every upstream call the qoder stack makes.
 */
export function getQoderEndpoints(hint) {
  const base = QODER_ENDPOINTS[resolveQoderRegion(hint)];
  return {
    loginUrl: base.loginUrl,
    deviceTokenUrl: `${base.openapiBase}/api/v1/deviceToken/poll`,
    userInfoUrl: `${base.openapiBase}/api/v1/userinfo`,
    quotaUsageUrl: `${base.openapiBase}/api/v2/quota/usage`,
    refreshTokenUrl: `${base.centerBase}/algo/api/v3/user/refresh_token`,
    jobTokenExchangeUrl: `${base.openapiBase}/api/v1/jobToken/exchange`,
    chatUrl: `${base.chatBase}/algo${QODER_CHAT_SIG_PATH}?FetchKeys=llm_model_result&AgentId=agent_common`,
    chatUrlEncoded: `${base.chatBase}/algo${QODER_CHAT_SIG_PATH}?FetchKeys=llm_model_result&AgentId=agent_common&Encode=1`,
    chatUrlEncodedAlt: `${base.chatBaseAlt}/algo${QODER_CHAT_SIG_PATH}?FetchKeys=llm_model_result&AgentId=agent_common&Encode=1`,
    modelListUrl: `${base.chatBase}/algo/api/v2/model/list`,
    modelListUrlAlt: `${base.chatBaseAlt}/algo/api/v2/model/list`,
  };
}

export const QODER_OPENAPI_BASE = QODER_ENDPOINTS.intl.openapiBase;
export const QODER_CENTER_BASE = QODER_ENDPOINTS.intl.centerBase;
export const QODER_CHAT_BASE = QODER_ENDPOINTS.intl.chatBase;
export const QODER_CHAT_BASE_ALT = QODER_ENDPOINTS.intl.chatBaseAlt;

export const QODER_LOGIN_URL = QODER_ENDPOINTS.intl.loginUrl;

// Device flow endpoints
export const QODER_DEVICE_TOKEN_URL = `${QODER_OPENAPI_BASE}/api/v1/deviceToken/poll`;
export const QODER_USERINFO_URL = `${QODER_OPENAPI_BASE}/api/v1/userinfo`;
export const QODER_QUOTA_USAGE_URL = `${QODER_OPENAPI_BASE}/api/v2/quota/usage`;
export const QODER_REFRESH_TOKEN_URL = `${QODER_CENTER_BASE}/algo/api/v3/user/refresh_token`;

// PAT (Personal Access Token, pt-...) → short-lived job token (jt-...) exchange.
// PATs cannot sign COSY requests directly — they must be exchanged first.
// This endpoint is NOT COSY-signed (plain JSON POST).
export const QODER_JOB_TOKEN_EXCHANGE_URL = `${QODER_OPENAPI_BASE}/api/v1/jobToken/exchange`;

// Inference endpoints (under /algo on api3.qoder.sh, all COSY-signed)
export const QODER_CHAT_SIG_PATH = "/api/v2/service/pro/sse/agent_chat_generation";
export const QODER_CHAT_URL = `${QODER_CHAT_BASE}/algo${QODER_CHAT_SIG_PATH}?FetchKeys=llm_model_result&AgentId=agent_common`;
export const QODER_CHAT_URL_ENCODED = `${QODER_CHAT_URL}&Encode=1`;
export const QODER_MODEL_LIST_URL = `${QODER_CHAT_BASE}/algo/api/v2/model/list`;

// COSY header constants. These are not arbitrary — the upstream signature
// validation matches them against the values used at signing time.
export const QODER_IDE_VERSION = "1.0.0";
export const QODER_CLIENT_TYPE = "5";
export const QODER_DATA_POLICY = "disagree";
export const QODER_LOGIN_VERSION = "v2";
export const QODER_MACHINE_OS = "x86_64_windows";
export const QODER_MACHINE_TYPE = "5";

// Canonical model identifiers. Identity map — keep as a map so callers can
// cheaply test "is this a known qoder model?" before sending the request.
export const QODER_MODEL_MAP = {
  // Tier models (intl only — the CN edition does not publish these)
  auto: "auto",
  ultimate: "ultimate",
  performance: "performance",
  efficient: "efficient",
  lite: "lite",
  // Frontier models (union of both editions; verified against the live
  // model/list of each on 2026-08-28)
  qmodel: "qmodel",
  qmodel_latest: "qmodel_latest",
  qmodel_preview: "qmodel_preview", // intl only
  qmodel_38max: "qmodel_38max", // cn only
  qfmodel: "qfmodel", // cn only
  q37fmodel: "q37fmodel", // cn only
  dmodel: "dmodel",
  dfmodel: "dfmodel",
  gmodel: "gmodel", // cn only (GLM-5.3)
  gfmodel: "gfmodel", // cn only (GLM-5.3-Flash)
  gm51model: "gm51model",
  kmodel: "kmodel",
  kmodel_latest: "kmodel_latest", // intl only
  mmodel: "mmodel",
};

// RSA public key for COSY encryption (extracted from Qoder IDE v0.9).
// Matches the CLIProxyAPIPlus branch and live qodercli traffic.
export const QODER_RSA_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDA8iMH5c02LilrsERw9t6Pv5Nc
4k6Pz1EaDicBMpdpxKduSZu5OANqUq8er4GM95omAGIOPOh+Nx0spthYA2BqGz+l
6HRkPJ7S236FZz73In/KVuLnwI8JJ2CbuJap8kvheCCZpmAWpb/cPx/3Vr/J6I17
XcW+ML9FoCI6AOvOzwIDAQAB
-----END PUBLIC KEY-----`;
