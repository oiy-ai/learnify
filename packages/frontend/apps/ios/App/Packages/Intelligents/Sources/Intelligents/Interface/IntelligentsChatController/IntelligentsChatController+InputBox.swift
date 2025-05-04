//
//  IntelligentsChatController+InputBox.swift
//  Intelligents
//
//  Created by 秋星桥 on 2024/11/18.
//

import UIKit

extension IntelligentsChatController {
  class InputBox: UIView {
    let backgroundView = UIView()
    let editor = InputEditView()

    init() {
      super.init(frame: .zero)

      setupLayout()

      editor.textEditor.font = UIFont.systemFont(ofSize: UIFont.labelFontSize)
      editor.placeholderText = "Summarize this article for me...".localized()

      backgroundView.backgroundColor = .init(
        light: .init(white: 1, alpha: 1),
        dark: .init(white: 0.15, alpha: 1)
      )
      backgroundView.layer.cornerRadius = 16
      backgroundView.layer.shadowColor = UIColor.black.withAlphaComponent(0.25).cgColor
      backgroundView.layer.shadowOffset = .init(width: 0, height: 0)
      backgroundView.layer.shadowRadius = 8
    }

    @available(*, unavailable)
    required init?(coder _: NSCoder) {
      fatalError()
    }
  }
}

private extension IntelligentsChatController.InputBox {
  func setupLayout() {
    addSubview(backgroundView)
    backgroundView.translatesAutoresizingMaskIntoConstraints = false

    addSubview(editor)
    editor.translatesAutoresizingMaskIntoConstraints = false

    let inset: CGFloat = 16

    [
      editor.leadingAnchor.constraint(equalTo: leadingAnchor, constant: inset),
      editor.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -inset),
      editor.topAnchor.constraint(equalTo: topAnchor, constant: inset),
      editor.bottomAnchor.constraint(equalTo: bottomAnchor, constant: -inset),
    ].forEach { $0.isActive = true }

    [
      backgroundView.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 0),
      backgroundView.trailingAnchor.constraint(equalTo: trailingAnchor, constant: 0),
      backgroundView.topAnchor.constraint(equalTo: topAnchor, constant: 0),
      backgroundView.bottomAnchor.constraint(equalTo: bottomAnchor, constant: 128),
    ].forEach { $0.isActive = true }
  }
}
