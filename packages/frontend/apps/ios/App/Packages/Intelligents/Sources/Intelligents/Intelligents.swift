// The Swift Programming Language
// https://docs.swift.org/swift-book

import AffineGraphQL
import Apollo
import Foundation

public enum Intelligents {
  public private(set) static var qlClient: ApolloClient = createQlClient()

  public static func setUpstreamEndpoint(_ upstream: String) {
    guard let url = URL(string: upstream) else {
      assertionFailure()
      return
    }
    print("[*] setting up upstream endpoint to \(url.absoluteString)")
    Constant.affineUpstreamURL = url
    qlClient = createQlClient()
  }
}

private extension Intelligents {
  private final class URLSessionCookieClient: URLSessionClient {
    init() {
      super.init()
      session.configuration.httpCookieStorage = .init()
      HTTPCookieStorage.shared.cookies?.forEach { cookie in
        self.session.configuration.httpCookieStorage?.setCookie(cookie)
      }
    }
  }

  static func createQlClient() -> ApolloClient {
    let store = ApolloStore(cache: InMemoryNormalizedCache())
    let provider = DefaultInterceptorProvider(
      client: URLSessionCookieClient(),
      shouldInvalidateClientOnDeinit: true,
      store: store
    )
    let transport = RequestChainNetworkTransport(
      interceptorProvider: provider,
      endpointURL: Constant.affineUpstreamURL.appendingPathComponent("graphql")
    )
    return .init(networkTransport: transport, store: store)
  }
}
