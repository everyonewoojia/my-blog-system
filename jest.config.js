module.exports = {
    testEnvironment: 'node',
    roots: ['<rootDir>/tests'],
    collectCoverageFrom: [
        'models/**/*.js',
        'controllers/**/*.js',
        '!config/**'
    ],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
        }
    }
};