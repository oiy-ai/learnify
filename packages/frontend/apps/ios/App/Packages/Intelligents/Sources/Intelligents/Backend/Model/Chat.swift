//
//  Chat.swift
//  Intelligents
//
//  Created by 秋星桥 on 2024/11/18.
//

import Foundation

struct Chat: Codable {
  enum ParticipantType: String, Codable, Equatable {
    case user
    case bot
  }

  var participant: ParticipantType

  typealias MarkdownDocument = String
  var content: MarkdownDocument
  var date: Date

  init(participant: ParticipantType, content: MarkdownDocument, date: Date = .init()) {
    self.participant = participant
    self.content = content
    self.date = date
  }
}
