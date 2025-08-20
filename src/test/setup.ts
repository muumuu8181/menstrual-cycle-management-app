import '@testing-library/jest-dom';

// Mock crypto.randomUUID for tests
if (!global.crypto) {
  global.crypto = {
    // @ts-ignore
    randomUUID: () => Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)
  };
}