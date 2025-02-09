const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    }

    // Ensure WebAssembly files are handled correctly
    config.module.rules.push({
      test: /\.wasm$/,
      type: "webassembly/async",
    })

    return config
  },
}

module.exports = nextConfig

