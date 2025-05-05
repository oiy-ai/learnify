// @ts-expect-error it's just a external script
Promise.withResolvers ??= function withResolvers() {
  let a,
    b,
    c = new this(function (resolve, reject) {
      a = resolve;
      b = reject;
    });
  return { resolve: a, reject: b, promise: c };
};
