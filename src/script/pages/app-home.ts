import { LitElement, css, html, customElement, property } from 'lit-element';

// @ts-ignore
import * as Magick from 'https://knicknic.github.io/wasm-imagemagick/magickApi.js';

import { fileOpen } from 'browser-nativefs';

import 'pinch-zoom-element';

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
  imageBlob: Blob | File | File[] | null = null;

  static get styles() {
    return css`
      #toolbar {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        /* width: 100%; */
        padding: 12px;
        background: #262626d1;
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
      }

      #saveButton {
        background: var(--app-color-secondary);
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

      @media(spanning: single-fold-vertical) {
        #welcomeBlock {
          width: 50%;
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

    this.mainCanvas.height = window.innerHeight - 80;
    this.mainCanvas.width = window.innerWidth;

    if (this.mainCanvas) {
      this.mainCanvasContext = (this.mainCanvas.getContext('2d') as CanvasRenderingContext2D);
    }
  }

  async openImage() {
    this.imageBlob = await fileOpen({
      mimeTypes: ['image/*'],
    });

    const img = new Image(window.innerWidth, window.innerHeight);

    img.onload = () => {

      if (this.mainCanvas) {
        this.mainCanvas.height = this.mainCanvas.width;

        this.mainCanvasContext?.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);

        this.mainCanvasContext?.drawImage(img, 0, 0, this.mainCanvas.width, this.mainCanvas.height);

        this.imageOpened = true;
      }
    }

    img.src = URL.createObjectURL(this.imageBlob);
  }

  async rotate() {
    const data = await (this.imageBlob as any).arrayBuffer();
    let magikData = await Magick.Call([{ 'name': 'srcFile.png', 'content': new Uint8Array(data) }], ["convert", "srcFile.png", "-rotate", "90", "out.png"]);

    this.imageBlob = magikData[0].blob;

    const img = new Image(window.innerWidth, window.innerHeight);

    img.onload = () => {
      if (this.mainCanvas) {
        this.mainCanvas.height = this.mainCanvas.width;

        this.mainCanvasContext?.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);

        this.mainCanvasContext?.drawImage(img, 0, 0, this.mainCanvas.width, this.mainCanvas.height);

        this.imageOpened = true;
      }
    }

    img.src = URL.createObjectURL(this.imageBlob);
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

  render() {
    return html`
    <app-header>

      ${this.imageOpened ? html`<button id="saveButton" @click="${() => this.openImage()}">
        Save Image
        <ion-icon name="save-outline"></ion-icon>
      </button>` : null}
      
      <button @click="${() => this.openImage()}">
        Open Image
        <ion-icon name="image-outline"></ion-icon>
      </button>
    </app-header>

      <div>

      ${
      this.imageOpened ? html`
        <div id="toolbar">
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

                  <button @click="${() => this.rotate()}">
                    rotate
                    <ion-icon name="refresh-circle-outline"></ion-icon>
                  </button>
        </div>
        ` : null}


        <pinch-zoom>
          <canvas id="onScreenCanvas"></canvas>
        </pinch-zoom>
      </div>
    `;
  }
}