//
//  Ext+UIColor.swift
//  Intelligents
//
//  Created by 秋星桥 on 2024/12/13.
//

import UIKit

extension UIColor {
  static var accent: UIColor {
    Constant.affineTintColor
  }

  convenience init(light: UIColor, dark: UIColor) {
    self.init(dynamicProvider: { traitCollection in
      switch traitCollection.userInterfaceStyle {
      case .light:
        light
      case .dark:
        dark
      default:
        light
      }
    })
  }
}
