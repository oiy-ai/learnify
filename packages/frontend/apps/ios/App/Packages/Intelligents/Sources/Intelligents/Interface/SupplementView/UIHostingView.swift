//
//  UIHostingView.swift
//  Intelligents
//
//  Created by 秋星桥 on 2024/12/13.
//

import SwiftUI
import UIKit

class UIHostingView<Content: View>: UIView {
  private let hostingViewController: UIHostingController<Content>

  var rootView: Content {
    get { hostingViewController.rootView }
    set { hostingViewController.rootView = newValue }
  }

  override var intrinsicContentSize: CGSize {
    hostingViewController.view.intrinsicContentSize
  }

  init(rootView: Content) {
    hostingViewController = UIHostingController(rootView: rootView)
    hostingViewController.edgesForExtendedLayout = []
    hostingViewController.extendedLayoutIncludesOpaqueBars = false
    super.init(frame: .zero)

    hostingViewController.view?.translatesAutoresizingMaskIntoConstraints = false
    addSubview(hostingViewController.view)
    if let view = hostingViewController.view {
      view.removeFromSuperview()
      view.backgroundColor = .clear
      view.isOpaque = false
      addSubview(view)
      let constraints = [
        view.topAnchor.constraint(equalTo: topAnchor),
        view.bottomAnchor.constraint(equalTo: bottomAnchor),
        view.leftAnchor.constraint(equalTo: leftAnchor),
        view.rightAnchor.constraint(equalTo: rightAnchor),
      ]
      NSLayoutConstraint.activate(constraints)
    }
  }

  @available(*, unavailable)
  required init?(coder _: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }

  override func sizeThatFits(_ size: CGSize) -> CGSize {
    hostingViewController.sizeThatFits(in: size)
  }
}
