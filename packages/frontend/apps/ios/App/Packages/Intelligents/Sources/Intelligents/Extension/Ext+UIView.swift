//
//  Ext+UIView.swift
//  Intelligents
//
//  Created by 秋星桥 on 2024/11/18.
//

import UIKit

extension UIView {
  var parentViewController: UIViewController? {
    var responder: UIResponder? = self
    while responder != nil {
      if let responder = responder as? UIViewController {
        return responder
      }
      responder = responder?.next
    }
    return nil
  }

  func removeEveryAutoResizingMasks() {
    var views: [UIView] = [self]
    while let view = views.first {
      views.removeFirst()
      view.translatesAutoresizingMaskIntoConstraints = false
      view.subviews.forEach { views.append($0) }
    }
  }

  #if DEBUG
    func debugFrame() {
      layer.borderWidth = 1
      layer.borderColor = [
        UIColor.red,
        .green,
        .blue,
        .yellow,
        .cyan,
        .magenta,
        .orange,
      ].map(\.cgColor).randomElement()
      subviews.forEach { $0.debugFrame() }
    }
  #endif
}
