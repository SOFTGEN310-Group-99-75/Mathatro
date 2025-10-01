// Mock Phaser module for testing
// NOTE: Math.random() is used here for test mocking purposes only, not for cryptographic operations.
// This is a test mock that simulates Phaser's random number generation for game logic testing.
// SonarQube S2245: Safe to use Math.random() in test mocks for non-security-sensitive operations.
export default {
    Math: {
        // NOSONAR: Math.random() is safe for test mocks - not used for cryptographic purposes
        Between: (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
    },
    Utils: {
        Array: {
            // NOSONAR: Math.random() is safe for test mocks - not used for cryptographic purposes
            Shuffle: <T>(array: T[]) => {
                const result = [...array];
                for (let i = result.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [result[i], result[j]] = [result[j], result[i]];
                }
                return result;
            }
        }
    },
    Scene: class {}
};
