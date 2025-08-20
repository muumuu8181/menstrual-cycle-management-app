import '@testing-library/jest-dom';

// Mock crypto.randomUUID for tests
if (!global.crypto) {
  global.crypto = {
    // @ts-expect-error Partial implementation for testing crypto randomUUID
    randomUUID: () => Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)
  };
}