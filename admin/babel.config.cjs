module.exports = {
  plugins: [
    ['@babel/plugin-transform-runtime', { corejs: 3 }]
  ],
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
};