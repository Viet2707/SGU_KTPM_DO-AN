module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.js'],
  moduleNameMapper: {
    // Mock các file CSS và hình ảnh
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/src/test/__mocks__/fileMock.js',
  },
  transform: {
    // Sử dụng babel-jest để chuyển đổi file js/jsx
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
};