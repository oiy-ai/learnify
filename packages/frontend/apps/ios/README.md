# iOS

AFFiNE iOS app.

## Build

- `yarn install`
- `BUILD_TYPE=canary PUBLIC_PATH="/" yarn affine @affine/ios build`
- `yarn affine @affine/ios cap sync`
- `yarn affine @affine/ios cap open ios`

## Live Reload

> Capacitor doc: https://capacitorjs.com/docs/guides/live-reload#using-with-framework-clis

- `yarn install`
- `yarn dev`
  - select `ios` for the "Distribution" option
- `yarn affine @affine/ios sync:dev`
- `yarn affine @affine/ios cap open ios`
