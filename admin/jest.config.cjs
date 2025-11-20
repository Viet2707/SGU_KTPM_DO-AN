module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/setup.js'],
  moduleNameMapper: {
    // Mock các file CSS
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // Mock các file hình ảnh và assets khác
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/fileMock.cjs',
  },
  transform: {
    // Sử dụng babel-jest để chuyển đổi file js/jsx
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: ["/node_modules/"],
};