module.exports = {
  plugins: [
    require("postcss-preset-env")({
      stage: 3,
      features: { "custom-properties": true }, // 必要なら調整
    }),
    require("autoprefixer"),
    ...(process.env.NODE_ENV === "production" ? [require("cssnano")] : []),
  ],
};
