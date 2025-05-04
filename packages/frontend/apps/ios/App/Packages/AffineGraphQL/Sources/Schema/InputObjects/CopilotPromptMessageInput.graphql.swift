// @generated
// This file was automatically generated and should not be edited.

import ApolloAPI

public struct CopilotPromptMessageInput: InputObject {
  public private(set) var __data: InputDict

  public init(_ data: InputDict) {
    __data = data
  }

  public init(
    content: String,
    params: GraphQLNullable<JSON> = nil,
    role: GraphQLEnum<CopilotPromptMessageRole>
  ) {
    __data = InputDict([
      "content": content,
      "params": params,
      "role": role
    ])
  }

  public var content: String {
    get { __data["content"] }
    set { __data["content"] = newValue }
  }

  public var params: GraphQLNullable<JSON> {
    get { __data["params"] }
    set { __data["params"] = newValue }
  }

  public var role: GraphQLEnum<CopilotPromptMessageRole> {
    get { __data["role"] }
    set { __data["role"] = newValue }
  }
}
