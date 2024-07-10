// import { Component } from '@angular/core';
// import { Router } from '@angular/router';
// @Component({
//   selector: 'app-image-page',
//   standalone: true,
//   imports: [],
//   templateUrl: './image-page.component.html',
//   styleUrl: '../cam-page/cam-page.component.css',
// })
// export class ImagePageComponent {
//   constructor(private router: Router) {}
//   switchWebcam() {
//     this.router.navigate(['/webcam']);
//   }
// }




import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import '@mediapipe/face_detection';
import '@tensorflow/tfjs-core';
import * as faceDetection from '@tensorflow-models/face-detection'; // Correct import

@Component({
  selector: 'app-image-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './image-page.component.html',
  styleUrls: ['../cam-page/cam-page.component.css'],
})
export class ImagePageComponent {
  constructor(private router: Router) {}

  isLoading: boolean = false;
  showVideo: boolean = false;
  errorMessage: string | null = null;
  isDetecting: boolean = false;
  selectedFile: File | null = null;
  faceCount: number | null = null;

  switchWebcam() {
    this.router.navigate(['/webcam']);
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  async detectFaces() {
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = async () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = async () => {
          this.isLoading = true;
          const model = await faceDetection.createDetector(
            faceDetection.SupportedModels.MediaPipeFaceDetector,
            {
              runtime: 'mediapipe',
              solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_detection',
            }
          );
          const predictions = await model.estimateFaces(img);
          this.isLoading = false;
          this.faceCount = predictions.length;

          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (ctx) {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0, img.width, img.height);

            predictions.forEach((prediction: any) => { // Add explicit type for prediction
              const start = prediction.topLeft as [number, number];
              const end = prediction.bottomRight as [number, number];
              const size = [end[0] - start[0], end[1] - start[1]];

              ctx.strokeStyle = 'red';
              ctx.lineWidth = 2;
              ctx.strokeRect(start[0], start[1], size[0], size[1]);
            });

            // Append the canvas to the document to visualize the result
            document.body.appendChild(canvas);
          }
        };
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  toggleDetection() { // Define toggleDetection method
    this.isDetecting = !this.isDetecting;
  }
}

