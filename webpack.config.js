const path = require('path');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const defaultConfig = require('openmrs/default-webpack-config');

module.exports = (env, argv = {}) => {
  const config = defaultConfig(env, argv);

  // Add source maps for dev debugging
  config.devtool = env.production ? false : 'eval-source-map';

  // Add resolve alias for form-engine-lib to use source files in development
  config.resolve = config.resolve || {};
  config.resolve.alias = config.resolve.alias || {};
  config.resolve.alias['@openmrs/esm-form-engine-lib'] = '@openmrs/esm-form-engine-lib/src/index';

  // Find and replace the ForkTsCheckerWebpackPlugin to only check src/ directory
  const forkTsCheckerIndex = config.plugins.findIndex(
    plugin => plugin instanceof ForkTsCheckerWebpackPlugin
  );

  if (forkTsCheckerIndex !== -1) {
    config.plugins[forkTsCheckerIndex] = new ForkTsCheckerWebpackPlugin({
      typescript: {
        configFile: path.resolve(__dirname, 'tsconfig.json'),
        // Only check files that match tsconfig include/exclude
        build: true,
        mode: 'write-references',
        // Don't check node_modules
        diagnosticOptions: {
          semantic: true,
          syntactic: true,
        },
      },
      issue: {
        // Exclude node_modules from type checking
        exclude: [
          { file: '**/node_modules/**' },
        ],
      },
    });
  }

  return config;
};
