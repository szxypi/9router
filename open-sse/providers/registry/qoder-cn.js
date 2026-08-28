export default {
  id: "qoder-cn",
  priority: 30,
  alias: "qdc",
  uiAlias: "qdc",
  display: {
    name: "Qoder CN",
    icon: "water_drop",
    color: "#EC4899",
    website: "https://qoder.com.cn",
    notice: {
      signupUrl: "https://qoder.com.cn",
    },
  },
  category: "oauth",
  authModes: ["oauth", "apikey"],
  hasOAuth: true,
  authHint: "Personal Access Token (pt-...) 来自 https://qoder.com.cn/account/integrations",
  transport: {
    baseUrl: "https://gateway.qoder.com.cn/algo/api/v2/service/pro/sse/agent_chat_generation",
    headers: {},
    timeoutMs: 120000,
    stallTimeoutMs: 120000,
    usage: {
      url: "https://openapi.qoder.com.cn/api/v2/quota/usage",
    },
  },
  // Verified against the live CN catalog (gateway.qoder.com.cn/algo/api/v2/model/list,
  // 2026-08-28): the CN edition ships neither the intl tier models
  // (ultimate/performance/efficient/lite) nor qmodel_preview/kmodel_latest, and
  // it carries GLM-5.3 + GLM-5.3-Flash, which intl does not. This static list is
  // only the fallback — chat and /v1/models prefer the live per-account catalog.
  models: [
    { id: "auto", name: "Auto", contextLength: 180000 },
    { id: "qmodel_38max", name: "Qwen3.8-Max", contextLength: 180000 },
    { id: "qfmodel", name: "Qwen3.8-Flash", contextLength: 180000 },
    { id: "qmodel_latest", name: "Qwen3.7-Max", contextLength: 180000 },
    { id: "qmodel", name: "Qwen3.7-Plus", contextLength: 180000 },
    { id: "q37fmodel", name: "Qwen3.7-Flash", contextLength: 180000 },
    { id: "dmodel", name: "DeepSeek-V4-Pro", contextLength: 180000 },
    { id: "dfmodel", name: "DeepSeek-V4-Flash", contextLength: 180000 },
    { id: "gmodel", name: "GLM-5.3", contextLength: 180000 },
    { id: "gfmodel", name: "GLM-5.3-Flash", contextLength: 1000000 },
    { id: "gm51model", name: "GLM-5.2", contextLength: 180000 },
    { id: "kmodel", name: "Kimi-K2.7-Code", contextLength: 180000 },
    { id: "mmodel", name: "MiniMax-M2.7", contextLength: 180000 },
  ],
  oauth: {
    openApiBaseUrl: "https://openapi.qoder.com.cn",
    centerBaseUrl: "https://center.qoder.com.cn",
    chatBaseUrl: "https://gateway.qoder.com.cn",
    deviceTokenUrl: "https://openapi.qoder.com.cn/api/v1/deviceToken/poll",
    refreshUrl: "https://center.qoder.com.cn/algo/api/v3/user/refresh_token",
    userInfoUrl: "https://openapi.qoder.com.cn/api/v1/userinfo",
    quotaUsageUrl: "https://openapi.qoder.com.cn/api/v2/quota/usage",
    loginUrl: "https://qoder.com.cn/device/selectAccounts",
  },
  features: {
    usage: true,
    // PAT (apikey) connections also carry quota usage (via job-token exchange).
    usageApikey: true,
  },
};
