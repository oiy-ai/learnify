// @generated
// This file was automatically generated and should not be edited.

import ApolloAPI

public struct ManageUserInput: InputObject {
  public private(set) var __data: InputDict

  public init(_ data: InputDict) {
    __data = data
  }

  public init(
    email: GraphQLNullable<String> = nil,
    name: GraphQLNullable<String> = nil
  ) {
    __data = InputDict([
      "email": email,
      "name": name
    ])
  }

  /// User email
  public var email: GraphQLNullable<String> {
    get { __data["email"] }
    set { __data["email"] = newValue }
  }

  /// User name
  public var name: GraphQLNullable<String> {
    get { __data["name"] }
    set { __data["name"] = newValue }
  }
}
