/**
 * Webpack loader to replace brand names during build time
 * This allows us to maintain the original source code while customizing the build output
 */

module.exports = function brandReplaceLoader(source) {
  // Skip replacement for certain file types that might break
  const resourcePath = this.resourcePath;

  // Skip binary files, images, fonts, etc.
  if (
    /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico|pdf)$/i.test(resourcePath)
  ) {
    return source;
  }

  // Skip node_modules to avoid breaking dependencies
  if (resourcePath.includes('node_modules')) {
    return source;
  }

  // Skip certain critical files where replacement might cause issues
  if (
    resourcePath.includes('.map') ||
    resourcePath.includes('manifest.json') ||
    resourcePath.includes('package.json')
  ) {
    return source;
  }

  // Get replacement config from environment or use defaults
  const replacements = [
    { from: /AFFiNE/g, to: process.env.BRAND_NAME || 'Learnify' },
    // You can add more replacements here if needed
    // { from: /affine\.pro/g, to: 'learnify.ai' },
  ];

  let result = source;
  replacements.forEach(({ from, to }) => {
    result = result.replace(from, to);
  });

  return result;
};
