//
//  Ext+String.swift
//  Intelligents
//
//  Created by 秋星桥 on 2024/11/18.
//

import Foundation

extension String {
  func localized() -> String {
    let ans = NSLocalizedString(self, bundle: Bundle.module, comment: "")
    guard !ans.isEmpty else {
      assertionFailure()
      return self
    }
    return ans
  }
}
