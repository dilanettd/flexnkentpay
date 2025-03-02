import { Component, inject, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { QRCodeModule } from 'angularx-qrcode';

@Component({
  selector: 'flexnkentpay-share-bar-code-modal',
  standalone: true,
  imports: [CommonModule, QRCodeModule],
  templateUrl: './share-bar-code-modal.component.html',
  styleUrl: './share-bar-code-modal.component.scss',
})
export class ShareBarCodeModalComponent implements OnInit {
  productCode: string = '';
  productId: number | null = null;
  productName: string = '';
  barcodeUrl: string = '';

  private toastr = inject(ToastrService);
  activeModal = inject(NgbActiveModal);

  ngOnInit(): void {
    if (!this.barcodeUrl && this.productCode) {
      console.log(
        'QR Code will be generated for product code:',
        this.productCode
      );
    }
  }

  downloadBarcode(): void {
    if (this.productCode) {
      const qrCanvas = document.querySelector(
        '#qrcode canvas'
      ) as HTMLCanvasElement;

      if (!qrCanvas) {
        this.toastr.error('QR code not available');
        return;
      }

      const imageUrl = qrCanvas.toDataURL('image/png');

      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `product-${this.productId}-qrcode.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      this.toastr.success('QR code downloaded successfully');
    } else {
      const imgElement = document.querySelector(
        '#barcodeUrl'
      ) as HTMLImageElement;

      if (!imgElement) {
        this.toastr.error('Barcode image not available');
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        this.toastr.error('Unable to get canvas context');
        return;
      }

      canvas.width = imgElement.naturalWidth;
      canvas.height = imgElement.naturalHeight;

      ctx.drawImage(imgElement, 0, 0);

      const imageUrl = canvas.toDataURL('image/png');

      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `product-${this.productId}-barcode.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      this.toastr.success('Barcode downloaded successfully');
    }
  }

  shareBarcode(): void {
    if (this.productCode) {
      const qrCanvas = document.querySelector(
        '#qrcode canvas'
      ) as HTMLCanvasElement;

      if (qrCanvas && navigator.share) {
        qrCanvas.toBlob((blob) => {
          if (blob) {
            const file = new File(
              [blob],
              `product-${this.productId}-qrcode.png`,
              { type: 'image/png' }
            );

            navigator
              .share({
                title: this.productName || 'Product',
                text: `Check out this product: ${
                  this.productName || 'Product'
                } (Code: ${this.productCode})`,
                files: [file],
              })
              .then(() => this.toastr.success('Shared successfully'))
              .catch((error) => {
                console.error('Share error:', error);
                this.shareUrl();
              });
          } else {
            this.shareUrl();
          }
        });
      } else {
        this.shareUrl();
      }
    } else {
      this.shareUrl();
    }
  }

  private shareUrl(): void {
    if (navigator.share) {
      navigator
        .share({
          title: this.productName || 'Product',
          text: `Check out this product: ${this.productName || 'Product'}`,
          url: this.barcodeUrl || window.location.href,
        })
        .then(() => this.toastr.success('Shared successfully'))
        .catch((error) => this.toastr.error('Share error: ' + error));
    } else {
      this.toastr.info(
        'The Web Share API is not supported by this browser. The barcode URL has been copied to the clipboard instead.'
      );
      this.copyBarcodeUrl();
    }
  }

  copyBarcodeUrl(): void {
    const textToCopy = this.barcodeUrl || this.productCode || '';

    if (!textToCopy) {
      this.toastr.error('No information available to copy');
      return;
    }

    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          this.toastr.success('Information copied to clipboard');
        })
        .catch((err) => {
          console.error('Clipboard API copy error:', err);
          this.fallbackCopy(textToCopy);
        });
    } else {
      this.fallbackCopy(textToCopy);
    }
  }

  private fallbackCopy(text: string): void {
    const textArea = document.createElement('textarea');
    textArea.value = text;

    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);

    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        this.toastr.success('Information copied to clipboard');
      } else {
        this.toastr.error('Copy failed');
      }
    } catch (err) {
      this.toastr.error('Copy error');
      console.error('Copy error:', err);
    }

    document.body.removeChild(textArea);
  }

  closeModal(): void {
    this.activeModal.dismiss();
  }
}
