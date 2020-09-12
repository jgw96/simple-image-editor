import { LitElement, css, html, customElement, property } from 'lit-element';


import { fileOpen, fileSave } from 'browser-nativefs';

//@ts-ignore
import * as Comlink from "https://unpkg.com/comlink/dist/esm/comlink.mjs";

import '../components/drag-drop';


// For more info on the @pwabuilder/pwainstall component click here https://github.com/pwa-builder/pwa-install
import '@pwabuilder/pwainstall';

@customElement('app-home')
export class AppHome extends LitElement {

  // For more information on using properties in lit-element
  // check out this link https://lit-element.polymer-project.org/guide/properties#declare-with-decorators
  @property() message: string = "Welcome!";
  @property() imageOpened: boolean = false;
  @property() imageBlob: File | File[] | Blob | null = null;
  @property() originalBlob: File | File[] | Blob | null = null;

  mainCanvas: HTMLCanvasElement | undefined;
  mainCanvasContext: CanvasRenderingContext2D | undefined;

  worker: any;
  img: any;

  static get styles() {
    return css`

      #welcome {
        color: white;
        display: flex;
        flex-direction: column;
        margin: 4em;
        align-items: center;
        text-align: center;
        font-weight: bold;
      }

      #toolbar {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        /* width: 100%; */
        padding: 12px;
        background: var(--app-color-primary);
        backdrop-filter: blur(8px);
        display: flex;
        justify-content: flex-end;
      }

      #toolbar fast-button, app-header fast-button, #welcome fast-button {
        margin-left: 6px;
      }

      pwa-install {
        position: absolute;
        bottom: 16px;
        right: 16px;
      }

      #fileInfo {
        color: white;
        margin: 10px;
      }

      canvas {
        background: #181818;
      }

      #dualExtras {
        position: absolute;
        bottom: 0;
        right: 0;
        color: white;
        width: 100%;
        display: flex;
        justify-content: flex-end;
        padding: 10px;
        padding-right: 6px;
      }

      @media(screen-spanning: single-fold-horizontal) {
        #toolbar {
          height: calc(env(fold-top) - 23px);
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
        }

        #toolbar button {
          margin-bottom: 10px;
        }
      }

      @media(min-width: 1200px) {
        #toolbar {
          top: 3.5em;
          bottom: initial;
          justify-content: flex-start;
        }
      }

      @media(max-width: 1200px) {
        #toolbar {
          display: initial;
          overflow-x: auto;
          overflow-y: hidden;
          white-space: nowrap;
        }

        #shareButton {
          position: absolute;
          top: 5em;
          right: 6px;
        }

        #revertButton {
          position: absolute;
          top: 5em;
          right: 88px;
        }

        #cropButton {
          position: absolute;
          top: 5em;
          right: 169px;
        }
      }

      @media(screen-spanning: single-fold-vertical) {
        #welcome {
          position: absolute;
          right: env(fold-left);
          justify-content: center;
          align-items: center;
        }

        #toolbar {
          left: calc(env(fold-right) - 1px);
          height: 89%;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;

          overflow: initial;
          white-space: initial;
        }

        #toolbar fast-button {
          margin-bottom: 10px;
        }
      }

      #openButton {
        background: var(--app-color-secondary) !important;
      }

      #saveButton {
        background: #5c2e91 !important;
      }
    `;
  }

  constructor() {
    super();
  }

  async init() {
    const underlying = new Worker("/assets/workers/worker.js");
    // WebWorkers use `postMessage` and therefore work with Comlink.
    this.worker = Comlink.wrap(underlying);
  }

  firstUpdated() {
    this.init();


    this.mainCanvas = (this.shadowRoot?.querySelector('#onScreenCanvas') as HTMLCanvasElement);

    const screenSegments = (window as any).getWindowSegments();
    if (screenSegments.length > 1) {
      // now we know the device is a foldable
      // it's recommended to test whether screenSegments[0].width === screenSegments[1].width
      // and we can update CSS classes in our layout as appropriate 

      // other changes as required for layout

      if (screenSegments[0].width === screenSegments[1].width) {
        this.mainCanvas.height = screenSegments[0].height - 60;
        this.mainCanvas.width = screenSegments[0].width + 1;
      }
      else {
        this.mainCanvas.height = window.innerHeight - 60;
        this.mainCanvas.width = screenSegments[0].width + 1;
      }
    }
    else {
      this.mainCanvas.height = window.innerHeight - 60;
      this.mainCanvas.width = window.innerWidth;
    }

    if (this.mainCanvas) {
      this.mainCanvasContext = (this.mainCanvas.getContext('2d') as CanvasRenderingContext2D);
    }

    navigator.serviceWorker.onmessage = (event) => {
      console.log(event);
      const imageBlob = event.data.file;

      if (imageBlob) {
        this.handleSharedImage(imageBlob);
      }
      
    };
  }

  handleSharedImage(blob: Blob) {
    this.img = new Image();

    this.img.onload = () => {
      if (this.mainCanvas) {

        // https://stackoverflow.com/questions/23104582/scaling-an-image-to-fit-on-canvas
        const hRatio = this.mainCanvas.width / this.img.naturalWidth;
        const vRatio = this.mainCanvas.height / this.img.naturalHeight;
        const ratio = Math.min(hRatio, vRatio);
        const centerShift_x = (this.mainCanvas.width - this.img.naturalWidth * ratio) / 2;
        const centerShift_y = (this.mainCanvas.height - this.img.naturalHeight * ratio) / 2;

        this.mainCanvasContext?.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);

        this.mainCanvasContext?.drawImage(this.img, 0, 0, this.img.naturalWidth, this.img.naturalHeight,
          centerShift_x, centerShift_y, this.img.width * ratio, this.img.height * ratio);

        this.imageOpened = true;
      }
    }

    this.img.src = URL.createObjectURL(blob);

    this.originalBlob = blob;

    this.imageBlob = this.originalBlob;
  }

  async openImage() {
    this.originalBlob = await fileOpen({
      mimeTypes: ['image/*'],
    });

    this.imageBlob = this.originalBlob;

    this.img = new Image();

    this.img.onload = () => {
      if (this.mainCanvas) {

        // https://stackoverflow.com/questions/23104582/scaling-an-image-to-fit-on-canvas
        const hRatio = this.mainCanvas.width / this.img.naturalWidth;
        const vRatio = this.mainCanvas.height / this.img.naturalHeight;
        const ratio = Math.min(hRatio, vRatio);
        const centerShift_x = (this.mainCanvas.width - this.img.naturalWidth * ratio) / 2;
        const centerShift_y = (this.mainCanvas.height - this.img.naturalHeight * ratio) / 2;

        this.mainCanvasContext?.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);

        this.mainCanvasContext?.drawImage(this.img, 0, 0, this.img.naturalWidth, this.img.naturalHeight,
          centerShift_x, centerShift_y, this.img.width * ratio, this.img.height * ratio);

        this.imageOpened = true;
      }
    }

    this.img.src = URL.createObjectURL(this.imageBlob);
  }

  async saveImage() {
    this.mainCanvas?.toBlob(async (blob) => {
      if (blob) {
        await fileSave(blob, {
          fileName: 'Untitled.png',
          extensions: ['.png'],
        });
      }
    });
  }

  shareImage() {
    this.mainCanvas?.toBlob(async (blob) => {
      if (blob) {
        const file = new File([blob], "untitled.png", {
          type: "image/png"
        });

        if ((navigator as any).canShare && (navigator as any).canShare({ files: [file] })) {
          await (navigator as any).share({
            files: [file],
            title: 'Edited image',
            text: 'edited image',
          })
        } else {
          console.log(`Your system doesn't support sharing files.`);
        }
      }
    });
  }

  async enhance() {
    const data = this.mainCanvasContext?.getImageData(0, 0, this.mainCanvas?.width || 0, this.mainCanvas?.height || 0);

    if (data) {
      const d = data.data;

      const data2 = await this.worker.enhance(d, data.width, data.height);

      this.mainCanvasContext?.putImageData(data2, 0, 0);
    }
  }

  async blackAndWhite() {
    const data = this.mainCanvasContext?.getImageData(0, 0, this.mainCanvas?.width || 0, this.mainCanvas?.height || 0);

    if (data) {
      const d = data.data;

      const data2 = await this.worker.blackAndWhite(d, data.width, data.height);

      this.mainCanvasContext?.putImageData(data2, 0, 0);
    }
  }

  async invert() {
    const data = this.mainCanvasContext?.getImageData(0, 0, this.mainCanvas?.width || 0, this.mainCanvas?.height || 0);

    if (data) {
      const d = data.data;

      const data2 = await this.worker.invert(d, data.width, data.height)

      this.mainCanvasContext?.putImageData(data2, 0, 0);
    }
  }

  async saturate() {
// https://github.com/klouskingsley/imagedata-filters/blob/master/src/filters/saturate.js
    const data = this.mainCanvasContext?.getImageData(0, 0, this.mainCanvas?.width || 0, this.mainCanvas?.height || 0);


    if (data) {
      const d = data.data;
      const data2 = await this.worker.saturate(d, data.width, data.height);

      this.mainCanvasContext?.putImageData(data2, 0, 0);
    }
  
  }

  async crop() {
    const canvasData = this.mainCanvas?.toDataURL();

    const blob = await this.worker.doAI(canvasData);

    if (blob) {
      await fileSave(blob, {
        fileName: 'Untitled.png',
        extensions: ['.png'],
      });
    }
  }

  async rotate() {
    const underlying = new Worker("/assets/workers/rotate.worker.js");
    // WebWorkers use `postMessage` and therefore work with Comlink.
    const rotateWorker = Comlink.wrap(underlying);

    this.mainCanvas?.toBlob(async (blob1) => {

      this.img = new Image();

      this.img.onload = async () => {

        const bitmap = await window.createImageBitmap(this.img);

        const blob = await rotateWorker.rotateImageOffscreen(this.mainCanvas?.width, this.mainCanvas?.height, bitmap);

        this.mainCanvasContext?.clearRect(0, 0, this.mainCanvas?.width || 0, this.mainCanvas?.height || 0);

        this.handleSharedImage(blob);
      };


      this.img.src = URL.createObjectURL(blob1);
    })
  }

  async revert() {
    this.handleSharedImage((this.originalBlob as Blob));
  }

  formatBytes(bytes: any, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  render() {
    return html`
    <app-header>

    ${this.imageOpened && (window as any).getWindowSegments().length <= 1 ? html`<fast-button id="shareButton" @click="${() => this.shareImage()}">
        Share
        <ion-icon name="share-outline"></ion-icon>
      </fast-button>` : null}

      ${this.imageOpened && (window as any).getWindowSegments().length <= 1 ? html`<fast-button id="cropButton" @click="${() => this.crop()}">
          Auto Thumbnail
          <ion-icon name="crop-outline"></ion-icon>
        </fast-button>` : null }

      ${this.imageOpened && (window as any).getWindowSegments().length <= 1 ? html`<fast-button id="revertButton" @click="${() => this.revert()}">
          revert
          <ion-icon name="refresh-outline"></ion-icon>
        </fast-button>` : null}
    
      ${this.imageOpened && (window as any).getWindowSegments().length <= 1 ? html`<fast-button id="saveButton" @click="${() => this.saveImage()}">
        Save Copy
        <ion-icon name="save-outline"></ion-icon>
      </fast-button>` : null}
    
      <fast-button id="openButton" @click="${() => this.openImage()}">
        Open Image
        <ion-icon name="image-outline"></ion-icon>
      </fast-button>
      
    </app-header>
    
    <div>
    
      ${this.imageOpened ? html`
      <div id="toolbar">
        ${(window as any).getWindowSegments().length > 1 ? html`<div id="fileInfo">
          <h3>
            ${this.imageBlob ? (this.imageBlob as File).name : "No File Name"}
          </h3>
    
          <p>Size: ${this.imageBlob ? this.formatBytes((this.imageBlob as File).size) : null}</p>
        </div>` : null}
    
        <fast-button @click="${() => this.invert()}">
          invert
          <ion-icon name="partly-sunny-outline"></ion-icon>
        </fast-button>
    
        <fast-button @click="${() => this.blackAndWhite()}">
          grayscale
          <ion-icon name="contrast-outline"></ion-icon>
        </fast-button>
    
        <fast-button @click="${() => this.enhance()}">
          brighten
          <ion-icon name="sunny-outline"></ion-icon>
        </fast-button>

        <fast-button @click="${() => this.saturate()}">
          saturate
          <ion-icon name="bulb-outline"></ion-icon>
        </fast-button>

        <fast-button @click="${() => this.rotate()}">
          rotate
          <ion-icon name="disc-outline"></ion-icon>
        </fast-button>

        ${
          (window as any).getWindowSegments().length > 1 ? html`
            <div id="dualExtras">

              <fast-button @click="${() => this.shareImage()}">
                Share
                <ion-icon name="share-outline"></ion-icon>
              </fast-button>

              <fast-button @click="${() => this.crop()}">
                Auto Thumbnail
                <ion-icon name="crop-outline"></ion-icon>
              </fast-button>

              <fast-button @click="${() => this.revert()}">
                Revert
                <ion-icon name="refresh-outline"></ion-icon>
              </fast-button>

              <fast-button id="saveButton" @click="${() => this.saveImage()}">
                Save Copy
                <ion-icon name="save-outline"></ion-icon>
              </fast-button>
              
            </div>
          ` : null
        }
      </div>
      ` : null}

      ${
        !this.imageOpened ? html`
          <div id="welcome">
            <p>
              Welcome! Make quick, simple edits to any image, tap "Open Image" to get started!
            </p>

            <fast-button appearance="primary" id="openButton" @click="${() => this.openImage()}">
              Open Image
              <ion-icon name="image-outline"></ion-icon>
            </fast-button>
          </div>
        ` : null
      }

      <drag-drop @got-file="${(event: any) => this.handleSharedImage(event.detail.file)}">
        <canvas id="onScreenCanvas"></canvas>
      </drag-drop>

      <pwa-install>Install SimpleEdit</pwa-install>
    </div>
    `;
  }
}