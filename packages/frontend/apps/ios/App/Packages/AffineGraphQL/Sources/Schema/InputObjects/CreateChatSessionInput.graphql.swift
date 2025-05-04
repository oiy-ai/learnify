// @generated
// This file was automatically generated and should not be edited.

import ApolloAPI

public struct CreateChatSessionInput: InputObject {
  public private(set) var __data: InputDict

  public init(_ data: InputDict) {
    __data = data
  }

  public init(
    docId: String,
    promptName: String,
    workspaceId: String
  ) {
    __data = InputDict([
      "docId": docId,
      "promptName": promptName,
      "workspaceId": workspaceId
    ])
  }

  public var docId: String {
    get { __data["docId"] }
    set { __data["docId"] = newValue }
  }

  /// The prompt name to use for the session
  public var promptName: String {
    get { __data["promptName"] }
    set { __data["promptName"] = newValue }
  }

  public var workspaceId: String {
    get { __data["workspaceId"] }
    set { __data["workspaceId"] = newValue }
  }
}
