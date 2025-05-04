//
//  IntelligentsFocusApertureView+Panel.swift
//  Intelligents
//
//  Created by 秋星桥 on 2024/11/21.
//

import UIKit

extension IntelligentsFocusApertureView {
  class ControlButtonsPanel: UIView {
    let headerLabel = UILabel()
    let headerIcon = UIImageView()

    let translateButton = DarkActionButton()
    let summaryButton = DarkActionButton()
    let chatWithAIButton = DarkActionButton()

    init() {
      super.init(frame: .zero)
      defer { removeEveryAutoResizingMasks() }

      let contentSpacing: CGFloat = 16
      let buttonGroupHeight: CGFloat = 55

      let headerGroup = UIView()
      addSubview(headerGroup)
      [
        headerGroup.topAnchor.constraint(equalTo: topAnchor),
        headerGroup.leadingAnchor.constraint(equalTo: leadingAnchor),
        headerGroup.trailingAnchor.constraint(equalTo: trailingAnchor),
      ].forEach { $0.isActive = true }

      headerLabel.text = NSLocalizedString("AFFiNE AI", comment: "") // TODO: FREE TRAIL???
      // title 3 with bold
      headerLabel.font = .preferredFont(for: .title3, weight: .bold)
      headerLabel.textColor = .white
      headerLabel.textAlignment = .left
      headerIcon.image = .init(named: "spark", in: .module, with: nil)
      headerIcon.contentMode = .scaleAspectFit
      headerIcon.tintColor = .accent
      headerGroup.addSubview(headerLabel)
      headerGroup.addSubview(headerIcon)
      [
        headerLabel.topAnchor.constraint(equalTo: headerGroup.topAnchor),
        headerLabel.leadingAnchor.constraint(equalTo: headerGroup.leadingAnchor),
        headerLabel.bottomAnchor.constraint(equalTo: headerGroup.bottomAnchor),

        headerIcon.topAnchor.constraint(equalTo: headerGroup.topAnchor),
        headerIcon.trailingAnchor.constraint(equalTo: headerGroup.trailingAnchor),
        headerIcon.bottomAnchor.constraint(equalTo: headerGroup.bottomAnchor),

        headerIcon.widthAnchor.constraint(equalToConstant: 32),
        headerIcon.trailingAnchor.constraint(equalTo: headerGroup.trailingAnchor),
        headerIcon.leadingAnchor.constraint(equalTo: headerLabel.trailingAnchor, constant: contentSpacing),
      ].forEach { $0.isActive = true }

      let firstButtonSectionGroup = UIView()
      addSubview(firstButtonSectionGroup)
      [
        firstButtonSectionGroup.topAnchor.constraint(equalTo: headerGroup.bottomAnchor, constant: contentSpacing),
        firstButtonSectionGroup.leadingAnchor.constraint(equalTo: leadingAnchor),
        firstButtonSectionGroup.trailingAnchor.constraint(equalTo: trailingAnchor),
        firstButtonSectionGroup.heightAnchor.constraint(equalToConstant: buttonGroupHeight),
      ].forEach { $0.isActive = true }

      translateButton.title = NSLocalizedString("Translate", comment: "")
      translateButton.iconSystemName = "textformat"
      summaryButton.title = NSLocalizedString("Summary", comment: "")
      summaryButton.iconSystemName = "doc.text"
      firstButtonSectionGroup.addSubview(translateButton)
      firstButtonSectionGroup.addSubview(summaryButton)
      [
        translateButton.topAnchor.constraint(equalTo: firstButtonSectionGroup.topAnchor),
        translateButton.leadingAnchor.constraint(equalTo: firstButtonSectionGroup.leadingAnchor),
        translateButton.bottomAnchor.constraint(equalTo: firstButtonSectionGroup.bottomAnchor),

        summaryButton.topAnchor.constraint(equalTo: firstButtonSectionGroup.topAnchor),
        summaryButton.trailingAnchor.constraint(equalTo: firstButtonSectionGroup.trailingAnchor),
        summaryButton.bottomAnchor.constraint(equalTo: firstButtonSectionGroup.bottomAnchor),

        translateButton.widthAnchor.constraint(equalTo: summaryButton.widthAnchor),
        translateButton.trailingAnchor.constraint(equalTo: summaryButton.leadingAnchor, constant: -contentSpacing),
      ].forEach { $0.isActive = true }

      let secondButtonSectionGroup = UIView()
      addSubview(secondButtonSectionGroup)
      [
        secondButtonSectionGroup.topAnchor.constraint(equalTo: firstButtonSectionGroup.bottomAnchor, constant: contentSpacing),
        secondButtonSectionGroup.leadingAnchor.constraint(equalTo: leadingAnchor),
        secondButtonSectionGroup.trailingAnchor.constraint(equalTo: trailingAnchor),
        secondButtonSectionGroup.heightAnchor.constraint(equalToConstant: buttonGroupHeight),
      ].forEach { $0.isActive = true }

      secondButtonSectionGroup.addSubview(chatWithAIButton)
      chatWithAIButton.title = NSLocalizedString("Chat with AI", comment: "")
      chatWithAIButton.iconSystemName = "paperplane"
      [
        chatWithAIButton.topAnchor.constraint(equalTo: secondButtonSectionGroup.topAnchor),
        chatWithAIButton.leadingAnchor.constraint(equalTo: secondButtonSectionGroup.leadingAnchor),
        chatWithAIButton.bottomAnchor.constraint(equalTo: secondButtonSectionGroup.bottomAnchor),
        chatWithAIButton.trailingAnchor.constraint(equalTo: secondButtonSectionGroup.trailingAnchor),
      ].forEach { $0.isActive = true }

      [
        secondButtonSectionGroup.bottomAnchor.constraint(equalTo: bottomAnchor),
      ].forEach { $0.isActive = true }
    }

    @available(*, unavailable)
    required init?(coder _: NSCoder) {
      fatalError()
    }
  }
}
