/** @type {import('next').NextConfig} */
// TODO check if possible to remove eslint-disable
// eslint-disable-next-line @typescript-eslint/no-var-requires
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const CopyPlugin = require('copy-webpack-plugin')

const nextConfig = {
  reactStrictMode: false,
  // TODO revert reactStrictMode to true
  // TODO Remove this bit of configuration
  // Added only to support JIMP 0.16.13 - this package should be updated and this error handled
  webpack: (config, { isServer }) => {
    // make shaders available for module import
    config.module.rules.push({
      test: /\.wgsl$/i,
      type: 'asset/source',
    })

    // TODO check if removable or if required
    config.plugins.push(
      new NodePolyfillPlugin(),
      new CopyPlugin({
        patterns: [
          {
            from: './node_modules/onnxruntime-web/dist/ort-wasm.wasm',
            to: 'static/chunks/pages',
          },
          {
            from: './node_modules/onnxruntime-web/dist/ort-wasm-simd.wasm',
            to: 'static/chunks/pages',
          },
          {
            from: './models',
            to: 'static/chunks/pages',
          },
        ],
      }),
    )

    if (isServer) return config
    else {
      config.resolve.fallback.fs = false
      return config
    }
  },
}

module.exports = nextConfig

// Injected content via Sentry wizard below
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { withSentryConfig } = require('@sentry/nextjs')

module.exports = withSentryConfig(
  module.exports,
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    // Suppresses source map uploading logs during build
    silent: true,

    org: 'sentry',
    project: 'react-image-flow',
  },
  {
    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Transpiles SDK to be compatible with IE11 (increases bundle size)
    transpileClientSDK: true,

    // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
    tunnelRoute: '/monitoring',

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,
  },
)
