import { QODER_CN_CONFIG } from "../constants/oauth.js";
import { buildQoderProvider } from "./qoder.js";

// Qoder China edition (qoder.com.cn) — same custom device flow as intl, but
// against the CN endpoint set (openapi.qoder.com.cn / gateway.qoder.com.cn).
const qoderCn = { ...buildQoderProvider("cn"), config: QODER_CN_CONFIG };

export default qoderCn;
