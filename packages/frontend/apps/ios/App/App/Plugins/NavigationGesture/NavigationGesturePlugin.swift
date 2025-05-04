import Capacitor
import Foundation

@objc(NavigationGesturePlugin)
public class NavigationGesturePlugin: CAPPlugin, CAPBridgedPlugin {
  public let identifier = "NavigationGesturePlugin"
  public let jsName = "NavigationGesture"
  public let pluginMethods: [CAPPluginMethod] = [
    CAPPluginMethod(name: "isEnabled", returnType: CAPPluginReturnPromise),
    CAPPluginMethod(name: "enable", returnType: CAPPluginReturnPromise),
    CAPPluginMethod(name: "disable", returnType: CAPPluginReturnPromise),
  ]

  @objc func isEnabled(_ call: CAPPluginCall) {
    let enabled = bridge?.webView?.allowsBackForwardNavigationGestures ?? true
    call.resolve(["value": enabled])
  }

  @objc func enable(_ call: CAPPluginCall) {
    DispatchQueue.main.sync {
      self.bridge?.webView?.allowsBackForwardNavigationGestures = true
      call.resolve([:])
    }
  }

  @objc func disable(_ call: CAPPluginCall) {
    DispatchQueue.main.sync {
      self.bridge?.webView?.allowsBackForwardNavigationGestures = false
      call.resolve([:])
    }
  }
}
