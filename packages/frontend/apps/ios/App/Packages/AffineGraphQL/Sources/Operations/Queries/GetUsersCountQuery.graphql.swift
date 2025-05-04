// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI

public class GetUsersCountQuery: GraphQLQuery {
  public static let operationName: String = "getUsersCount"
  public static let operationDocument: ApolloAPI.OperationDocument = .init(
    definition: .init(
      #"query getUsersCount { usersCount }"#
    ))

  public init() {}

  public struct Data: AffineGraphQL.SelectionSet {
    public let __data: DataDict
    public init(_dataDict: DataDict) { __data = _dataDict }

    public static var __parentType: any ApolloAPI.ParentType { AffineGraphQL.Objects.Query }
    public static var __selections: [ApolloAPI.Selection] { [
      .field("usersCount", Int.self),
    ] }

    /// Get users count
    public var usersCount: Int { __data["usersCount"] }
  }
}
