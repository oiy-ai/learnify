//
//  InputEditView+Photo.swift
//  Intelligents
//
//  Created by 秋星桥 on 2024/12/6.
//

import PhotosUI
import UIKit

extension InputEditView: PHPickerViewControllerDelegate {
  @objc func selectPhoto() {
    var config = PHPickerConfiguration(photoLibrary: .shared())
    config.filter = .images
    config.selectionLimit = 9
    let picker = PHPickerViewController(configuration: config)
    picker.modalPresentationStyle = .formSheet
    picker.delegate = self
    parentViewController?.present(picker, animated: true, completion: nil)
  }

  func picker(_ picker: PHPickerViewController, didFinishPicking results: [PHPickerResult]) {
    picker.dismiss(animated: true)
    loadPNG(from: results)
  }

  private func loadPNG(from results: [PHPickerResult]) {
    for result in results {
      result.itemProvider.loadObject(ofClass: UIImage.self) { [weak self] image, _ in
        if let image = image as? UIImage {
          DispatchQueue.main.async {
            self?.viewModel.attachments.append(image)
          }
        }
      }
    }
  }
}
