//
//  Ext+EventHandler.swift
//  Intelligents
//
//  Created by 秋星桥 on 2024/12/26.
//

import Foundation
import LDSwiftEventSource

class BlockEventHandler: EventHandler {
  var onOpenedBlock: (() -> Void)?
  var onClosedBlock: (() -> Void)?
  var onMessageBlock: ((String, LDSwiftEventSource.MessageEvent) -> Void)?
  var onCommentBlock: ((String) -> Void)?
  var onErrorBlock: ((Error) -> Void)?

  public func onOpened() {
    onOpenedBlock?()
  }

  public func onClosed() {
    onClosedBlock?()
  }

  public func onMessage(eventType: String, messageEvent: LDSwiftEventSource.MessageEvent) {
    onMessageBlock?(eventType, messageEvent)
  }

  public func onComment(comment: String) {
    onCommentBlock?(comment)
  }

  public func onError(error: any Error) {
    onErrorBlock?(error)
  }
}
