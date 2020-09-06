import { LitElement, css, html, customElement, property } from 'lit-element';


import { fileOpen, fileSave } from 'browser-nativefs';


// For more info on the @pwabuilder/pwainstall component click here https://github.com/pwa-builder/pwa-install
import '@pwabuilder/pwainstall';

@customElement('app-home')
export class AppHome extends LitElement {

  // For more information on using properties in lit-element
  // check out this link https://lit-element.polymer-project.org/guide/properties#declare-with-decorators
  @property() message: string = "Welcome!";
  @property() imageOpened: boolean = false;

  mainCanvas: HTMLCanvasElement | undefined;
  mainCanvasContext: CanvasRenderingContext2D | undefined;
  imageBlob: File | File[] | null = null;

  static get styles() {
    return css`
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

      #toolbar button, app-header button {
        border: none;
        padding: 10px;
        font-weight: bold;
        border-radius: 6px;
        color: white;
        background: #181818;
        margin-left: 6px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 14px;
      }

      #openButton {
        background: var(--app-color-secondary);
      }

      #saveButton {
        background: #5c2e91;
      }

      pwa-install {
        position: absolute;
        bottom: 16px;
        right: 16px;
      }

      button {
        cursor: pointer;
      }

      button ion-icon {
        font-size: 18px;
        margin-left: 6px;
      }

      #fileInfo {
        color: white;
        margin: 10px;
      }

      canvas {
        background: #181818;
      }

      @media(screen-spanning: single-fold-vertical) {
        #welcomeBlock {
          width: 50%;
        }

        #toolbar {
          left: calc(env(fold-right) - 1px);
          height: 89%;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
        }

        #toolbar button {
          margin-bottom: 10px;
        }
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
    `;
  }

  constructor() {
    super();
  }

  firstUpdated() {
    // this method is a lifecycle even in lit-element
    // for more info check out the lit-element docs https://lit-element.polymer-project.org/guide/lifecycle
    console.log('This is your home page');

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
  }

  async openImage() {
    this.imageBlob = await fileOpen({
      mimeTypes: ['image/*'],
    });

    const img = new Image();

    img.onload = () => {
      if (this.mainCanvas) {

        // https://stackoverflow.com/questions/23104582/scaling-an-image-to-fit-on-canvas
        const hRatio = this.mainCanvas.width / img.naturalWidth;
        const vRatio = this.mainCanvas.height / img.naturalHeight;
        const ratio = Math.min(hRatio, vRatio);
        const centerShift_x = (this.mainCanvas.width - img.naturalWidth * ratio) / 2;
        const centerShift_y = (this.mainCanvas.height - img.naturalHeight * ratio) / 2;

        this.mainCanvasContext?.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);

        this.mainCanvasContext?.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight,
          centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);

        this.imageOpened = true;
      }
    }

    img.src = URL.createObjectURL(this.imageBlob);
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

  async enhance(adjustment = 40) {
    const data = this.mainCanvasContext?.getImageData(0, 0, this.mainCanvas?.width || 0, this.mainCanvas?.height || 0);
    console.log(data);

    if (data) {
      const d = data.data;

      for (var i = 0; i < d.length; i += 4) {
        d[i] += adjustment;
        d[i + 1] += adjustment;
        d[i + 2] += adjustment;
      }

      this.mainCanvasContext?.putImageData(data, 0, 0);
    }
  }

  async blackAndWhite() {
    const data = this.mainCanvasContext?.getImageData(0, 0, this.mainCanvas?.width || 0, this.mainCanvas?.height || 0);
    console.log(data);

    if (data) {
      const d = data.data;

      for (var i = 0; i < d.length; i += 4) {
        let r = d[i];
        let g = d[i + 1];
        let b = d[i + 2];
        // CIE luminance for the RGB
        // The human eye is bad at seeing red and blue, so we de-emphasize them.
        let v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        d[i] = d[i + 1] = d[i + 2] = v
      }

      this.mainCanvasContext?.putImageData(data, 0, 0);
    }
  }

  async invert() {
    const data = this.mainCanvasContext?.getImageData(0, 0, this.mainCanvas?.width || 0, this.mainCanvas?.height || 0);
    console.log(data);

    if (data) {
      const d = data.data;

      for (var i = 0; i < d.length; i += 4) {
        var r = d[i];
        var g = d[i + 1];
        var b = d[i + 2];
        var v = (0.2126 * r + 0.7152 * g + 0.0722 * b >= 90) ? 255 : 0;
        d[i] = d[i + 1] = d[i + 2] = v
      }

      this.mainCanvasContext?.putImageData(data, 0, 0);
    }
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

      ${this.imageOpened ? html`<button id="saveButton" @click="${() => this.saveImage()}">
        Save Copy
        <ion-icon name="save-outline"></ion-icon>
      </button>` : null}
      
      <button id="openButton" @click="${() => this.openImage()}">
        Open Image
        <ion-icon name="image-outline"></ion-icon>
      </button>
    </app-header>

      <div>

      ${
      this.imageOpened ? html`
        <div id="toolbar">
        ${(window as any).getWindowSegments().length > 1 ? html`<div id="fileInfo">
          <h3>
            ${this.imageBlob ? (this.imageBlob as File).name : "No File Name"}
          </h3>

      <p>Size: ${this.imageBlob ? this.formatBytes((this.imageBlob as File).size) : null}</p>
        </div>` : null}

                  <button @click="${() => this.invert()}">
                    invert
                    <ion-icon name="partly-sunny-outline"></ion-icon>
                  </button>

                  <button @click="${() => this.blackAndWhite()}">
                    grayscale
                    <ion-icon name="contrast-outline"></ion-icon>
                  </button>

                  <button @click="${() => this.enhance()}">
                    brighten
                    <ion-icon name="sunny-outline"></ion-icon>
                  </button>
        </div>
        ` : null}

          <canvas id="onScreenCanvas"></canvas>
      </div>
    `;
  }
}