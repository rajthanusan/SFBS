module.exports = {
    env: {
      browser: true,
      es2021: true,
      node: true, // Adding node as an environment as you're using `module.exports`
    },
    extends: [
      'eslint:recommended',
      'plugin:react/recommended',
    ],
    parserOptions: {
      ecmaVersion: 2021, // Use a more up-to-date version (if you're using ES2021 features)
      sourceType: 'module', // Explicitly specify the module type
      ecmaFeatures: {
        jsx: true, // Enable JSX parsing
      },
    },
    plugins: [
      'react',
    ],
    settings: {
      react: {
        version: 'detect', // Automatically detects the React version
      },
    },
    rules: {
      // You can add your custom rules here
    },
  };
  