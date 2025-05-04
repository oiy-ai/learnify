import Capacitor
import Foundation

@objc(CookiePlugin)
public class CookiePlugin: CAPPlugin, CAPBridgedPlugin {
  public let identifier = "CookiePlugin"
  public let jsName = "Cookie"
  public let pluginMethods: [CAPPluginMethod] = [
    CAPPluginMethod(name: "getCookies", returnType: CAPPluginReturnPromise),
  ]

  let cookieManager = CookieManager()

  @objc public func getCookies(_ call: CAPPluginCall) {
    guard let url = call.getString("url") else {
      return call.resolve([:])
    }

    call.resolve(cookieManager.getCookies(url))
  }
}
