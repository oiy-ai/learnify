# Brand Replacement Feature

This project includes a build-time brand replacement feature that allows you to replace "AFFiNE" with "Learnify" (or any other brand name) without modifying the source code. This maintains Git history and makes it easier to sync updates from the upstream AFFiNE project.

## How it works

A custom Webpack loader (`tools/cli/src/webpack/brand-replace-loader.js`) processes JavaScript, TypeScript, and CSS files during the build process to replace brand names.

## Usage

### For Development

```bash
# Use the original AFFiNE branding
yarn dev

# Use Learnify branding
yarn dev:learnify
# or manually:
ENABLE_BRAND_REPLACE=true BRAND_NAME=Learnify yarn dev
```

### For Production Build

```bash
# Use the original AFFiNE branding
yarn build

# Use Learnify branding
yarn build:learnify
# or manually:
ENABLE_BRAND_REPLACE=true BRAND_NAME=Learnify yarn build
```

### In GitHub Actions

The brand replacement is automatically enabled in the CI/CD pipeline. The following environment variables are set:

- `ENABLE_BRAND_REPLACE=true`
- `BRAND_NAME=Learnify`

## Customization

To use a different brand name, set the `BRAND_NAME` environment variable:

```bash
ENABLE_BRAND_REPLACE=true BRAND_NAME=YourBrand yarn build
```

## Adding More Replacements

Edit `tools/cli/src/webpack/brand-replace-loader.js` to add more replacement patterns:

```javascript
const replacements = [
  { from: /AFFiNE/g, to: process.env.BRAND_NAME || 'Learnify' },
  // Add more patterns here
  { from: /affine\.pro/g, to: 'learnify.ai' },
];
```

## Important Notes

1. This replacement happens at build time, not in the source code
2. The original source files remain unchanged
3. Binary files (images, fonts, etc.) are not processed
4. Node modules are excluded from replacement to avoid breaking dependencies
5. Some critical files like manifest.json and package.json are also excluded

## Troubleshooting

If you encounter issues:

1. Ensure the environment variables are set correctly
2. Check that the loader is properly configured in the Webpack config
3. Look for any hardcoded strings that might need to be added to the replacement patterns
