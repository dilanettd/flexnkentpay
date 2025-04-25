import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { catchError, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProductService } from '../../../../core/services/product/product.service';
import { ZXingScannerComponent, ZXingScannerModule } from '@zxing/ngx-scanner';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  BrowserMultiFormatReader,
  DecodeHintType,
  BarcodeFormat,
} from '@zxing/library';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'flexnkentpay-qrcode-modal',
  standalone: true,
  imports: [ZXingScannerModule, CommonModule, TranslateModule],
  templateUrl: './qrcode-modal.component.html',
  styleUrl: './qrcode-modal.component.scss',
})
export class QrcodeModalComponent implements OnInit, OnDestroy {
  @ViewChild('scanner') scanner!: ZXingScannerComponent;

  private destroy$ = new Subject<void>();
  private codeReader: BrowserMultiFormatReader;

  scannerEnabled = true;
  qrResult: string | null = null;
  selectedFile: File | null = null;
  errorMessage: string | null = null;
  hasCameras = true;
  availableCameras: MediaDeviceInfo[] = [];
  currentCamera: MediaDeviceInfo | undefined;
  isLoading = false;
  scannerInitialized = false;
  scanMethod: 'camera' | 'gallery' = 'camera'; // Default to camera

  constructor(
    public activeModal: NgbActiveModal,
    private router: Router,
    private productService: ProductService,
    private translateService: TranslateService
  ) {
    // Configure the reader to only look for QR codes
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);
    this.codeReader = new BrowserMultiFormatReader(hints);
  }

  ngOnInit(): void {
    this.initializeScanner();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.codeReader.reset();
  }

  private initializeScanner(): void {
    setTimeout(() => {
      if (this.scanner && this.scanMethod === 'camera') {
        this.scanner.camerasFound
          .pipe(takeUntil(this.destroy$))
          .subscribe((cameras: MediaDeviceInfo[]) => {
            this.isLoading = false;
            this.availableCameras = cameras;
            this.hasCameras = cameras.length > 0;

            if (this.hasCameras) {
              this.currentCamera = cameras[0];
              this.scannerEnabled = true;
              this.scannerInitialized = true;
            } else {
              this.handleNoCameras();
            }
          });

        this.scanner.camerasNotFound
          .pipe(takeUntil(this.destroy$))
          .subscribe(() => {
            this.isLoading = false;
            this.handleNoCameras();
          });

        this.scanner.scanComplete
          .pipe(takeUntil(this.destroy$))
          .subscribe(() => {
            this.scannerInitialized = true;
          });

        this.scanner.scanError
          .pipe(takeUntil(this.destroy$))
          .subscribe((error: Error) => {
            console.error('Scanner error:', error);
            this.errorMessage = this.translateService.instant(
              'QR_SCANNER.ERROR.CAMERA_ACCESS'
            );
            this.isLoading = false;
          });
      } else {
        // If scan method is gallery, don't need to initialize scanner
        this.isLoading = false;
      }
    }, 1000); // Delay to ensure the component is fully initialized
  }

  private handleNoCameras(): void {
    this.hasCameras = false;
    this.scannerEnabled = false;
    this.errorMessage = this.translateService.instant(
      'QR_SCANNER.ERROR.NO_CAMERAS'
    );
    console.log('No cameras found');
  }

  switchCamera(): void {
    if (this.availableCameras.length > 1) {
      const currentIndex = this.availableCameras.findIndex(
        (camera) => camera.deviceId === this.currentCamera?.deviceId
      );
      const nextIndex = (currentIndex + 1) % this.availableCameras.length;
      this.currentCamera = this.availableCameras[nextIndex];
    }
  }

  onScanSuccess(result: string): void {
    if (!this.qrResult) {
      this.qrResult = result;
      this.scannerEnabled = false;
      this.fetchProductByCode(result);
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.decodeQRCodeFromImage(file);
    }
  }

  private decodeQRCodeFromImage(file: File): void {
    this.isLoading = true;
    this.errorMessage = null;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const imageUrl = e.target.result;

      // Create an image element to get the image dimensions
      const img = new Image();
      img.onload = () => {
        // Create a canvas and draw the image on it
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          this.errorMessage = this.translateService.instant(
            'QR_SCANNER.ERROR.CANVAS_NOT_SUPPORTED'
          );
          this.isLoading = false;
          return;
        }

        // Set canvas dimensions to image dimensions
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw image to canvas
        ctx.drawImage(img, 0, 0);

        // Get the image data as URL from canvas
        const imageDataUrl = canvas.toDataURL('image/png');

        // Try to decode QR code from the image data URL
        try {
          this.codeReader
            .decodeFromImageUrl(imageDataUrl)
            .then((result) => {
              if (result && result.getText()) {
                this.qrResult = result.getText();
                this.fetchProductByCode(this.qrResult);
              } else {
                this.errorMessage = this.translateService.instant(
                  'QR_SCANNER.ERROR.NO_QR_FOUND'
                );
                this.isLoading = false;
              }
            })
            .catch((err) => {
              console.error('Decoding error:', err);
              this.errorMessage = this.translateService.instant(
                'QR_SCANNER.ERROR.DECODE_FAILED'
              );
              this.isLoading = false;
            });
        } catch (error) {
          console.error('Decoding error:', error);
          this.errorMessage = this.translateService.instant(
            'QR_SCANNER.ERROR.PROCESS_FAILED'
          );
          this.isLoading = false;
        }
      };

      img.onerror = () => {
        this.errorMessage = this.translateService.instant(
          'QR_SCANNER.ERROR.LOAD_FAILED'
        );
        this.isLoading = false;
      };

      img.src = imageUrl;
    };

    reader.onerror = () => {
      this.errorMessage = this.translateService.instant(
        'QR_SCANNER.ERROR.READ_FAILED'
      );
      this.isLoading = false;
    };

    reader.readAsDataURL(file);
  }

  fetchProductByCode(code: string): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.productService
      .getProductByCode(code)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          this.errorMessage = this.translateService.instant(
            'QR_SCANNER.ERROR.PRODUCT_NOT_FOUND'
          );
          this.isLoading = false;
          return of(null);
        })
      )
      .subscribe((product) => {
        this.isLoading = false;
        if (product) {
          this.activeModal.close(product);
          this.router.navigate(['/product', product.id]);
        } else {
          this.errorMessage = this.translateService.instant(
            'QR_SCANNER.ERROR.NO_PRODUCT'
          );
        }
      });
  }

  retryScanner(): void {
    this.errorMessage = null;
    this.scannerEnabled = true;
    this.qrResult = null;
    this.initializeScanner();
  }

  closeModal(): void {
    this.activeModal.dismiss();
  }
}
