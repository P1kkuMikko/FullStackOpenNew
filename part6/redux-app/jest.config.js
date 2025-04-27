module.exports = {
    testEnvironment: "jsdom",
    moduleNameMapper: {
        // Handle CSS imports
        "\\.(css|less|scss|sass)$": "<rootDir>/__mocks__/styleMock.js",
        // Handle image imports
        "\\.(jpg|jpeg|png|gif|webp|svg)$": "<rootDir>/__mocks__/fileMock.js"
    },
    transform: {
        "^.+\\.(js|jsx)$": "babel-jest"
    },
    setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"]
};