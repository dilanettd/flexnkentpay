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
      // Important: le composant QR génère un canvas, mais il est enveloppé dans un div
      // Le sélecteur doit cibler le canvas lui-même, pas seulement la classe du wrapper
      const qrCodeElement = document.querySelector('.qrcode_canvas');
      const qrCanvas =
        qrCodeElement?.querySelector('canvas') ||
        document.querySelector('#qrcode canvas');

      console.log('QR Canvas found:', qrCanvas); // Pour le débogage

      if (!qrCanvas) {
        this.toastr.error('QR code canvas not found');
        return;
      }

      try {
        // Vérifiez que c'est bien un objet HTMLCanvasElement
        if (!(qrCanvas instanceof HTMLCanvasElement)) {
          this.toastr.error('Found element is not a canvas');
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
      } catch (error) {
        console.error('Error generating image from canvas:', error);
        this.toastr.error('Failed to generate QR code image');
      }
    } else if (this.barcodeUrl) {
      // Utilisation directe de l'URL du code-barres
      this.downloadImageFromURL(this.barcodeUrl);
    } else {
      this.toastr.error('No barcode or QR code available to download');
    }
  }

  // Méthode auxiliaire pour télécharger directement à partir de l'URL
  private downloadImageFromURL(url: string): void {
    // Créer un lien avec l'URL de l'image et déclencher le téléchargement
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `product-${this.productId}-barcode.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
        this.toastr.success('Barcode downloaded successfully');
      })
      .catch((error) => {
        console.error('Error downloading image:', error);
        this.toastr.error('Failed to download barcode');
      });
  }

  shareBarcode(): void {
    if (this.productCode) {
      // Utiliser le même sélecteur amélioré que dans downloadBarcode
      const qrCodeElement = document.querySelector('.qrcode_canvas');
      const qrCanvas =
        qrCodeElement?.querySelector('canvas') ||
        document.querySelector('#qrcode canvas') ||
        document.querySelector('#qrcode_container canvas');

      console.log('QR Canvas for sharing found:', qrCanvas);

      if (qrCanvas instanceof HTMLCanvasElement && navigator.share) {
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
