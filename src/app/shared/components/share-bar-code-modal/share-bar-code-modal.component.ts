import { Component, inject, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { QRCodeModule } from 'angularx-qrcode';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'flexnkentpay-share-bar-code-modal',
  standalone: true,
  imports: [CommonModule, QRCodeModule, TranslateModule],
  templateUrl: './share-bar-code-modal.component.html',
  styleUrl: './share-bar-code-modal.component.scss',
})
export class ShareBarCodeModalComponent implements OnInit {
  productCode: string = '';
  productId: number | null = null;
  productName: string = '';

  private toastr = inject(ToastrService);
  private translateService = inject(TranslateService);
  activeModal = inject(NgbActiveModal);

  ngOnInit(): void {}

  downloadBarcode(): void {
    if (this.productCode) {
      const qrCodeElement = document.querySelector('.qrcode_canvas');
      const qrCanvas =
        qrCodeElement?.querySelector('canvas') ||
        document.querySelector('#qrcode canvas');

      console.log('QR Canvas found:', qrCanvas); // Pour le débogage

      if (!qrCanvas) {
        this.toastr.error(
          this.translateService.instant('BARCODE_SHARE.ERROR.CANVAS_NOT_FOUND')
        );
        return;
      }

      try {
        // Vérifiez que c'est bien un objet HTMLCanvasElement
        if (!(qrCanvas instanceof HTMLCanvasElement)) {
          this.toastr.error(
            this.translateService.instant('BARCODE_SHARE.ERROR.NOT_CANVAS')
          );
          return;
        }

        const imageUrl = qrCanvas.toDataURL('image/png');

        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `product-${this.productId}-qrcode.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.toastr.success(
          this.translateService.instant('BARCODE_SHARE.SUCCESS.DOWNLOAD')
        );
      } catch (error) {
        console.error('Error generating image from canvas:', error);
        this.toastr.error(
          this.translateService.instant('BARCODE_SHARE.ERROR.GENERATE_FAILED')
        );
      }
    } else {
      this.toastr.error(
        this.translateService.instant('BARCODE_SHARE.ERROR.NO_CODE')
      );
    }
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
                title:
                  this.productName ||
                  this.translateService.instant('BARCODE_SHARE.PRODUCT_CODE'),
                text: `${this.translateService.instant(
                  'BARCODE_SHARE.SHARE_TEXT'
                )} ${
                  this.productName ||
                  this.translateService.instant('BARCODE_SHARE.PRODUCT_CODE')
                } (Code: ${this.productCode})`,
                files: [file],
              })
              .then(() =>
                this.toastr.success(
                  this.translateService.instant('BARCODE_SHARE.SUCCESS.SHARED')
                )
              )
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
          title:
            this.productName ||
            this.translateService.instant('BARCODE_SHARE.PRODUCT_CODE'),
          text: `${this.translateService.instant('BARCODE_SHARE.SHARE_TEXT')} ${
            this.productName ||
            this.translateService.instant('BARCODE_SHARE.PRODUCT_CODE')
          }`,
          url: window.location.href,
        })
        .then(() =>
          this.toastr.success(
            this.translateService.instant('BARCODE_SHARE.SUCCESS.SHARED')
          )
        )
        .catch((error) =>
          this.toastr.error(
            `${this.translateService.instant(
              'BARCODE_SHARE.ERROR.SHARE_ERROR'
            )} ${error}`
          )
        );
    } else {
      this.toastr.info(
        this.translateService.instant('BARCODE_SHARE.INFO.NOT_SUPPORTED')
      );
      this.copyBarcodeUrl();
    }
  }

  copyBarcodeUrl(): void {
    const textToCopy = this.productCode || '';

    if (!textToCopy) {
      this.toastr.error(
        this.translateService.instant('BARCODE_SHARE.ERROR.NO_INFO')
      );
      return;
    }

    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          this.toastr.success(
            this.translateService.instant('BARCODE_SHARE.SUCCESS.COPIED')
          );
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
        this.toastr.success(
          this.translateService.instant('BARCODE_SHARE.SUCCESS.COPIED')
        );
      } else {
        this.toastr.error(
          this.translateService.instant('BARCODE_SHARE.ERROR.COPY_FAILED')
        );
      }
    } catch (err) {
      this.toastr.error(
        this.translateService.instant('BARCODE_SHARE.ERROR.COPY_ERROR')
      );
      console.error('Copy error:', err);
    }

    document.body.removeChild(textArea);
  }

  closeModal(): void {
    this.activeModal.dismiss();
  }
}
