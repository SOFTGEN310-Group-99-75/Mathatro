// Mock Phaser module for testing
export default {
    Math: {
        Between: (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
    },
    Utils: {
        Array: {
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
