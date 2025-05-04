//
//  Ext+UIFont.swift
//  Intelligents
//
//  Created by 秋星桥 on 2024/11/21.
//

import UIKit

extension UIFont {
  static func preferredFont(for style: TextStyle, weight: Weight, italic: Bool = false) -> UIFont {
    // Get the style's default pointSize
    let traits = UITraitCollection(preferredContentSizeCategory: .large)
    let desc = UIFontDescriptor.preferredFontDescriptor(withTextStyle: style, compatibleWith: traits)

    // Get the font at the default size and preferred weight
    var font = UIFont.systemFont(ofSize: desc.pointSize, weight: weight)
    if italic == true {
      font = font.with([.traitItalic])
    }

    // Setup the font to be auto-scalable
    let metrics = UIFontMetrics(forTextStyle: style)
    return metrics.scaledFont(for: font)
  }

  private func with(_ traits: UIFontDescriptor.SymbolicTraits...) -> UIFont {
    guard let descriptor = fontDescriptor.withSymbolicTraits(UIFontDescriptor.SymbolicTraits(traits).union(fontDescriptor.symbolicTraits)) else {
      return self
    }
    return UIFont(descriptor: descriptor, size: 0)
  }
}
