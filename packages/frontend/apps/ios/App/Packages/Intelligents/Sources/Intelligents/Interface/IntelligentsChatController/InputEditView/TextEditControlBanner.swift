//
//  TextEditControlBanner.swift
//  Intelligents
//
//  Created by 秋星桥 on 2024/11/18.
//

import UIKit

class TextEditControlBanner: UIStackView {
  static let height: CGFloat = 32

  let cameraButton = UIButton()
  let photoButton = UIButton()

  let spacer = UIView()

  let sendButton = UIButton()

  init() {
    super.init(frame: .zero)

    axis = .horizontal
    spacing = 16
    alignment = .center
    distribution = .fill

    [
      heightAnchor.constraint(equalToConstant: Self.height),
    ].forEach { $0.isActive = true }

    [
      cameraButton, photoButton,
      sendButton,
    ].forEach {
      $0.widthAnchor.constraint(equalToConstant: Self.height).isActive = true
      $0.heightAnchor.constraint(equalToConstant: Self.height).isActive = true
    }

    [
      cameraButton, photoButton,
      spacer,
      sendButton,
    ].forEach {
      $0.translatesAutoresizingMaskIntoConstraints = false
      addArrangedSubview($0)
    }

    cameraButton.setImage(.init(systemName: "camera"), for: .normal)
    cameraButton.tintColor = .label
    photoButton.setImage(.init(systemName: "photo"), for: .normal)
    photoButton.tintColor = .label

    sendButton.setImage(.init(systemName: "paperplane.fill"), for: .normal)
    sendButton.tintColor = .label
  }

  @available(*, unavailable)
  required init(coder _: NSCoder) {
    fatalError()
  }
}
