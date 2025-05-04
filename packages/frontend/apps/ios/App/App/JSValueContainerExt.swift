//
//  JSValueContainerExt.swift
//  App
//
//  Created by EYHN on 2025/1/2.
//
import Capacitor

enum RequestParamError: Error {
  case request(key: String)
}

extension JSValueContainer {
  public func getStringEnsure(_ key: String) throws -> String {
    guard let str = self.getString(key) else {
      throw RequestParamError.request(key: key)
    }
    return str
  }
  
  public func getIntEnsure(_ key: String) throws -> Int {
    guard let int = self.getInt(key) else {
      throw RequestParamError.request(key: key)
    }
    return int
  }
  
  public func getDoubleEnsure(_ key: String) throws -> Double {
    guard let doub = self.getDouble(key) else {
      throw RequestParamError.request(key: key)
    }
    return doub
  }
  
  public func getBoolEnsure(_ key: String) throws -> Bool {
    guard let bool = self.getBool(key) else {
      throw RequestParamError.request(key: key)
    }
    return bool
  }
  
  public func getArrayEnsure(_ key: String) throws -> JSArray {
    guard let arr = self.getArray(key) else {
      throw RequestParamError.request(key: key)
    }
    return arr
  }
  
  public func getArrayEnsure<T>(_ key: String, _ ofType: T.Type) throws -> [T] {
    guard let arr = self.getArray(key, ofType) else {
      throw RequestParamError.request(key: key)
    }
    return arr
  }
}
