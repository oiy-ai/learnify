import Foundation
import UIKit

public class CookieManager: NSObject {
  public func getCookies(_ urlString: String) -> [String: String] {
    var cookiesMap: [String: String] = [:]
    let jar = HTTPCookieStorage.shared
    guard let url = getServerUrl(urlString) else { return [:] }
    if let cookies = jar.cookies(for: url) {
      for cookie in cookies {
        cookiesMap[cookie.name] = cookie.value
      }
    }
    return cookiesMap
  }

  private func isUrlSanitized(_ urlString: String) -> Bool {
    urlString.hasPrefix("http://") || urlString.hasPrefix("https://")
  }

  public func getServerUrl(_ urlString: String) -> URL? {
    let validUrlString = isUrlSanitized(urlString) ? urlString : "http://\(urlString)"

    guard let url = URL(string: validUrlString) else {
      return nil
    }

    return url
  }
}
