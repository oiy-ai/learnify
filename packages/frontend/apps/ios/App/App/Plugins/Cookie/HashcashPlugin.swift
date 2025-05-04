import Capacitor

@objc(HashcashPlugin)
public class HashcashPlugin: CAPPlugin, CAPBridgedPlugin {
  public let identifier = "HashcashPlugin"
  public let jsName = "Hashcash"
  public let pluginMethods: [CAPPluginMethod] = [
    CAPPluginMethod(name: "hash", returnType: CAPPluginReturnPromise),
  ]

  @objc func hash(_ call: CAPPluginCall) {
    DispatchQueue.global(qos: .default).async {
      let challenge = call.getString("challenge") ?? ""
      let bits = call.getInt("bits") ?? 20
      call.resolve(["value": hashcashMint(resource: challenge, bits: UInt32(bits))])
    }
  }
}
