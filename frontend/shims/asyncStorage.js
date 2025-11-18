// Browser shim for @react-native-async-storage/async-storage
// Provides minimal async API used by some libraries when running in browser.
module.exports = {
  getItem: async (key) => null,
  setItem: async (key, value) => null,
  removeItem: async (key) => null,
  clear: async () => null,
  getAllKeys: async () => [],
};
