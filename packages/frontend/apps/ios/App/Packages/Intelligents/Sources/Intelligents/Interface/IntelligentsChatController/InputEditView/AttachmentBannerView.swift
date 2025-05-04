//
//  AttachmentBannerView.swift
//  Intelligents
//
//  Created by 秋星桥 on 2024/11/18.
//

import UIKit

private let attachmentSize: CGFloat = 100
private let attachmentSpacing: CGFloat = 16

class AttachmentBannerView: UIScrollView {
  var readAttachments: (() -> ([UIImage]))?
  var onAttachmentsDelete: ((Int) -> Void)?
  var attachments: [UIImage] {
    get { readAttachments?() ?? [] }
    set { assertionFailure() }
  }

  override var intrinsicContentSize: CGSize {
    if attachments.isEmpty { return .zero }
    return .init(
      width: (attachmentSize + attachmentSize) * CGFloat(attachments.count)
        - attachmentSpacing,
      height: attachmentSize
    )
  }

  let stackView = UIStackView()

  init() {
    super.init(frame: .zero)

    translatesAutoresizingMaskIntoConstraints = false

    showsHorizontalScrollIndicator = false
    showsVerticalScrollIndicator = false

    stackView.axis = .horizontal
    stackView.spacing = attachmentSpacing
    stackView.alignment = .center
    stackView.distribution = .fill
    stackView.translatesAutoresizingMaskIntoConstraints = false
    addSubview(stackView)
    [
      stackView.topAnchor.constraint(equalTo: topAnchor),
      stackView.leadingAnchor.constraint(equalTo: leadingAnchor),
      stackView.trailingAnchor.constraint(equalTo: trailingAnchor),
      stackView.bottomAnchor.constraint(equalTo: bottomAnchor),
    ].forEach { $0.isActive = true }

    rebuildViews()
  }

  @available(*, unavailable)
  required init?(coder _: NSCoder) {
    fatalError()
  }

  var reusableViews = [AttachmentPreviewView]()

  func rebuildViews() {
    let attachments = attachments

    if reusableViews.count > attachments.count {
      for index in attachments.count ..< reusableViews.count {
        reusableViews[index].removeFromSuperview()
      }
      reusableViews.removeLast(reusableViews.count - attachments.count)
    }
    if reusableViews.count < attachments.count {
      for _ in reusableViews.count ..< attachments.count {
        let view = AttachmentPreviewView()
        view.alpha = 0
        reusableViews.append(view)
      }
    }

    assert(reusableViews.count == attachments.count)

    for (index, attachment) in attachments.enumerated() {
      let view = reusableViews[index]
      view.imageView.image = attachment
      stackView.addArrangedSubview(view)
      view.deleteButtonAction = { [weak self] in
        self?.onAttachmentsDelete?(index)
      }
    }

    invalidateIntrinsicContentSize()
    contentSize = intrinsicContentSize
    UIView.performWithoutAnimation {
      self.layoutIfNeeded()
    }

    UIView.animate(withDuration: 0.3) {
      for view in self.reusableViews {
        view.alpha = 1
      }
    }
  }
}

extension AttachmentBannerView {
  class AttachmentPreviewView: UIView {
    let imageView = UIImageView()
    let deleteButton = UIButton()

    var deleteButtonAction: (() -> Void)?

    override var intrinsicContentSize: CGSize {
      .init(width: attachmentSize, height: attachmentSize)
    }

    init() {
      super.init(frame: .zero)
      addSubview(imageView)
      addSubview(deleteButton)

      layer.cornerRadius = 8
      clipsToBounds = true

      imageView.contentMode = .scaleAspectFill
      imageView.clipsToBounds = true
      imageView.translatesAutoresizingMaskIntoConstraints = false
      [
        imageView.topAnchor.constraint(equalTo: topAnchor),
        imageView.leadingAnchor.constraint(equalTo: leadingAnchor),
        imageView.trailingAnchor.constraint(equalTo: trailingAnchor),
        imageView.bottomAnchor.constraint(equalTo: bottomAnchor),
      ].forEach { $0.isActive = true }

      deleteButton.setImage(.init(named: "close", in: .module, with: nil), for: .normal)
      deleteButton.imageView?.contentMode = .scaleAspectFit
      deleteButton.tintColor = .white
      deleteButton.translatesAutoresizingMaskIntoConstraints = false
      [
        deleteButton.topAnchor.constraint(equalTo: topAnchor, constant: 4),
        deleteButton.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -4),
        deleteButton.widthAnchor.constraint(equalToConstant: 32),
        deleteButton.heightAnchor.constraint(equalToConstant: 32),
      ].forEach { $0.isActive = true }

      deleteButton.addTarget(self, action: #selector(deleteButtonTapped), for: .touchUpInside)

      [
        widthAnchor.constraint(equalToConstant: attachmentSize),
        heightAnchor.constraint(equalToConstant: attachmentSize),
      ].forEach { $0.isActive = true }
    }

    @available(*, unavailable)
    required init?(coder _: NSCoder) {
      fatalError()
    }

    @objc func deleteButtonTapped() {
      deleteButtonAction?()
      deleteButtonAction = nil
    }
  }
}
