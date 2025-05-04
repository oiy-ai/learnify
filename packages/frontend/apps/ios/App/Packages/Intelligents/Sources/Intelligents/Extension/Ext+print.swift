//
//  Ext+print.swift
//  Intelligents
//
//  Created by 秋星桥 on 2024/11/18.
//

import Foundation

public func print(_ items: Any..., separator: String = " ", terminator: String = "\n") {
  #if DEBUG
    Swift.print(items, separator: separator, terminator: terminator)
  #endif
}
