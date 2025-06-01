import { defineConfig } from "tailwindcss";

export default defineConfig({
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,vue}",
  ],
  
  // 在 v4 中，color: default 相当于不指定任何颜色选项
  color: {
    default: "oklch",
  },
});