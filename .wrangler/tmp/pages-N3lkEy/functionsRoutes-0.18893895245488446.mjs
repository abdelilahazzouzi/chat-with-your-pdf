import { onRequestPost as __api_chat_ts_onRequestPost } from "C:\\Users\\abdel\\Documents\\antigravity\\Chat With Your PDF\\functions\\api\\chat.ts"

export const routes = [
    {
      routePath: "/api/chat",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_chat_ts_onRequestPost],
    },
  ]