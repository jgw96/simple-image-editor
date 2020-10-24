import { LitElement, css, html, customElement, internalProperty } from 'lit-element';


import { fileOpen, fileSave, FileSystemHandle } from 'browser-nativefs';

//@ts-ignore
import * as Comlink from "https://unpkg.com/comlink/dist/esm/comlink.mjs";

import '../components/drag-drop';
import '../components/camera';


// For more info on the @pwabuilder/pwainstall component click here https://github.com/pwa-builder/pwa-install
import '@pwabuilder/pwainstall';
import { clear, get, set } from 'idb-keyval';

@customElement('app-home')
export class AppHome extends LitElement {

  // For more information on using properties in lit-element
  // check out this link https://lit-element.polymer-project.org/guide/properties#declare-with-decorators
  @internalProperty() message: string = "Welcome!";
  @internalProperty() imageOpened: boolean = false;
  @internalProperty() imageBlob: File | File[] | Blob | null = null;
  @internalProperty() originalBlob: File | File[] | Blob | null = null;
  @internalProperty() latest: any[] | null | undefined = null;
  @internalProperty() applying: boolean = false;
  @internalProperty() handlingShortcut: boolean = false;
  @internalProperty() takingPhoto: boolean = false;

  mainCanvas: HTMLCanvasElement | undefined;
  mainCanvasContext: CanvasRenderingContext2D | undefined;
  imageBitmap: ImageBitmap | undefined;

  worker: any;
  img: any;

  static get styles() {
    return css`
    fast-dialog::part(positioning-region) {
      z-index: 9999;
      padding: 15%;
      background: #181818ab;
      backdrop-filter: blur(10px);
    }

    fast-dialog::part(control) {
      padding-left: 12px;
      padding-right: 12px;
      
      display: flex;
      flex-direction: column;
      height: fit-content;
      padding-bottom: 2em;
    }

    fast-progress {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 9999;
    }

      #latestBlock h3 {
        text-align: initial;
      }
      
      #latestBlock fast-card {
        margin-top: 1em;
        padding: 0px;
        padding-bottom: 12px;
      }

      #latestBlock {
        width: 100%;
      }

      #latestBlock fast-card img {
        object-fit: cover;
        width: 100%;
      }

      #welcome {
        display: flex;
        flex-direction: column;
        margin: 4em;
        align-items: center;
        text-align: center;
        font-weight: bold;
        align-self: flex-start;
      }

      #homePhoto {
        position: absolute;
        bottom: 0;
        max-height: 24em;
        right: 0;
      }

      @media(max-width: 290px) {
        #welcome {
          margin: 1em;
        }

        app-header #openButton {
          display: none;
        }
      }

      @media(max-width: 800px) {
        #homePhoto {
          max-height: 20em;
        }
      }
      #toolbar {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 12px;
        background: #201f1ede;
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

      @media(max-width: 1000px) {
        pwa-install {
          top: 4.5em;
          left: 6px;
          bottom: initial;
        }

        #fileInfo {
          display: none;
        }
      }

      #fileInfo {
        color: white;
        margin: 10px;
        margin-bottom: 0;
      }

      canvas {
        background: #181818;
        width: 70vw;
      }

      #imageWrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        margin-top: 4em;
        height: 84vh;
      }

      #imageWrapper img {
        transform: translate(var(--x), var(--y)) scale(var(--scale));
        transform-origin: 0 0;
        will-change: transform;
        max-width: 100%;
      }

      
      #dualExtras {
        position: absolute;
        bottom: 0;
        right: 0;
        color: white;
        width: 100%;
        justify-content: flex-end;
        padding: 10px;
        padding-right: 6px;
        display: none;
      }
      @media(min-width: 1000px) {
        #toolbar {
          left: 0;
          right: initial;
          top: 0;
          width: 16em;
          justify-content: initial;
          flex-direction: column;

          animation-duration: 0.4s;
          animation-name: slidein;
          animation-fill-mode: forwards;

          contain: content;
        }

        app-header #takePhotoButton {
          margin-left: 2em;
        }

        #onScreenCanvas {
          margin-left: 12em;
        }

        #toolbarActions {
          flex-direction: column;
          display: flex;
          width: 100%;
        }

        #toolbarActions fast-button {
          margin-bottom: 8px;
        }

        #fileInfo {
          overflow: hidden;
          margin-top: 2.4em;
        }

        #recentsBlock {
          display: flex;
          justify-content: flex-start;
        }
        #latestBlock {
          margin-top: 2em;
        }
        #latestBlock fast-card {
          margin-right: 1em;
          max-width: 22em;
        }
        #latestBlock fast-card img {
          height: 300px;
        }

        fast-dialog::part(positioning-region) {
          padding-left: 35%;
          padding-right: 35%;
        }

        fast-dialog::part(control) {
          padding-bottom: 3em;
        }
      }

      @media (max-width: 800px) {
        canvas {
          width: 100%;
        }
      }

      @media(max-width: 1000px) {
        #toolbar {
          display: initial;
          justify-content: initial;
          z-index: 1;
        }

        #toolbarActions {
          display: grid;
          grid-template-columns: auto auto auto;
        }

        #toolbar fast-button {
          margin: 6px;
        }
        #latestBlock {
          display: none;
        }
        #shareButton {
          position: absolute;
          top: 5em;
          right: 6px;
        }
        #revertButton {
          position: absolute;
          top: 5em;
          right: 82px;
        }

        #takePhotoButton {
          position: absolute;
          top: 5em;
          right: 158px;
        }

        #cropButton {
          position: absolute;
          top: 5em;
          right: 169px;
        }

        #imageWrapper img {
          height: initial;
          max-width: 100%;
        }
      }
      @media(screen-spanning: single-fold-horizontal) {

        .headerAction {
          display: none;
        }

        #toolbar {
          display: flex !important;
          flex-direction: column;
          justify-content: flex-start;
          height: 50%;
        }
        #toolbar fast-button {
          margin-bottom: 10px;
        }
        #dualExtras {
          display: flex;
        }
        #toolbarActions {
          display: flex;
          flex-direction: column;
          overflow: scroll;
          max-height: 22.2em;
        }

        #fileInfo {
          display: initial;
        }

        .headerSaveButton, .headerAction {
          display: none;
        }
      }
      @media(screen-spanning: single-fold-vertical) {
        .headerAction {
          display: none;
        }

        #toolbarActions {
          display: flex;
          flex-direction: column;
        }

        #fileInfo {
          display: initial;
          margin-top: 0em;
        }

        #welcome {
          display: flex;
          flex-direction: row;
          right: initial;
          margin: 0;
          margin-top: 1em;
          justify-content: center;
          align-items: center;
          width: 50%;
        }
        #welcome #latestBlock {
          flex: 1;
          margin: 2em;
          margin-right: 1em;
          margin-top: 0em;
          overflow: hidden;
        }

        #welcome #welcomeIntro {
          margin-right: env(fold-width);
          overflow-y: scroll;
          flex: 0 0 calc(env(fold-left) - 49px);
          margin-left: 2em;
        }
        
        #toolbar {
          left: initial;
          right: 0px;
          height: 89%;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          width: 47%;
          overflow: initial;
          white-space: initial;
        }
        #toolbar fast-button {
          margin-bottom: 10px;
        }
        #dualExtras {
          display: flex;
          padding-right: 12px;
        }
        .headerSaveButton {
          display: none;
        }

        canvas {
          width: 100%;
        }

        #onScreenCanvas {
          margin-left: 0;
        }

        #toolbar {
          top: initial;
          animation-name: slideup;
        }
      }

      #dualExtras #dualTakePhoto {
        background: var(--app-color-secondary);
        bottom: 10px;
        top: initial;
        left: 12px;
        right: initial;
        position: fixed;
      }

      #openButton {
        background: var(--app-color-secondary);
      }
      #saveButton {
        background: #5c2e91 !important;
      }

      @keyframes slidein {
        from {
          transform: translateX(-300px);
          opacity: 0;
        }
      
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes slideup {
        from {
          transform: translateY(300px);
          opacity: 0;
        }
      
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
    `;
  }

  constructor() {
    super();
  }

  async init() {
    this.mainCanvas = (this.shadowRoot?.querySelector('#onScreenCanvas') as HTMLCanvasElement);
    this.resizeCanvas();

    let offscreen = this.mainCanvas.transferControlToOffscreen();

    const underlying = new Worker("/assets/workers/worker.js");
    underlying.postMessage({canvas: offscreen}, [offscreen]);
    
    this.worker = Comlink.wrap(underlying);
  }

  async firstUpdated() {
    this.init();

    navigator.serviceWorker.onmessage = (event) => {
      console.log('file event', event);
      console.log('file event data', event.data);
      const imageBlob = event.data.file;

      if (imageBlob) {
        this.handleSharedImage(imageBlob);
      }
    };

    this.fileHandler();

    if (location.search.includes("edit")) {
      this.handlingShortcut = true;
    }

    window.onresize = () => {
      this.resizeCanvas();

      if (this.imageBlob) {
        this.handleSharedImage((this.imageBlob as Blob));
      }
      
    }

    this.latest = await this.getLatest();
  }

  async fileHandler() {
    if ('launchQueue' in window) {
      (window as any).launchQueue.setConsumer(async (launchParams: any) => {
        if (!launchParams.files.length) {
          return;
        }
        
    
        const fileHandle = launchParams.files[0];
        console.log('fileHandle', fileHandle);
        
        this.handleRecent(fileHandle);
      });
    }
  }

  resizeCanvas() {
    if (this.mainCanvas) {
      if ((window as any).getWindowSegments) {
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
      }
      else {
        this.mainCanvas.height = window.innerHeight - 60;
        this.mainCanvas.width = window.innerWidth;
      }
    }
  }

  handleSharedImage(blob: Blob) {
    this.img = new Image();

    this.img.onload = async () => {
      if (this.mainCanvas) {
        this.imageBitmap = await window.createImageBitmap(this.img);

        this.worker.loadImage(this.imageBitmap, this.img.naturalWidth, this.img.naturalHeight);

        this.imageOpened = true;
      }
    }

    this.img.src = URL.createObjectURL(blob);

    this.originalBlob = blob;

    this.imageBlob = blob;

    if (this.takingPhoto) {
      this.takingPhoto = false;
    }
  }

  async handleRecent(handle: any) {
    const existingPerm = await handle.queryPermission({
      writable: true
    });

    if (existingPerm === "granted") {
      const blob = await handle.getFile();
      this.handleSharedImage(blob);
    }
    else {
      const request = await handle.requestPermission({
        writable: true
      })
  
      console.log(request);
  
      if (request === "granted") {
        const blob = await handle.getFile();
        console.log(blob);
  
        this.handleSharedImage(blob);
      }
    }
  }

  async getLatest() {
    const latest: Array<any> = await get('savedImages');

    if (latest && latest.length > 0) {
      return latest;
    }
    else {
      return null;
    }
  }

  async saveLatest(handle: FileSystemHandle) {
   const latest: Array<any> = await get('savedImages');

   if (handle) {
    if (latest && latest.length > 2) {
      await clear();
 
      const newImage = [{
       name: handle.name || "simpleedit",
       handle: handle,
       preview: this.originalBlob
     }];
 
      await set('savedImages',
       newImage
      );
 
      return newImage;
    }
    else if (latest && latest.length > 0) {
     const newImage = [...latest, {
      name: handle.name || "simpleedit",
      handle: handle,
      preview: this.originalBlob
    }];
    
     await set('savedImages', newImage)
 
     return newImage;
   }
    else {
      const newImage = [{
       name: handle.name || "simpleedit",
       handle: handle,
       preview: this.originalBlob
     }];
 
      await set('savedImages',
       newImage
      );
 
      return newImage;
    }
   }
   else {
     return;
   }
  }

  async openImage() {
    this.originalBlob = await fileOpen({
      mimeTypes: ['image/*'],
    });

    this.latest = await this.saveLatest((this.originalBlob as any).handle);

    this.imageBlob = this.originalBlob;

    this.img = new Image();

    this.img.onload = async () => {
      if (this.mainCanvas) {

        this.imageBitmap = await window.createImageBitmap(this.img);

        this.worker.loadImage(this.imageBitmap, this.img.naturalWidth, this.img.naturalHeight);

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

  async technicolor() {
    this.applyWebglFilter("technicolor");
  }

  async polaroid() {
    this.applyWebglFilter("polaroid");
  }

  async sepia() {
    this.applyWebglFilter("sepia");
  }

  writeCanvas(blob: Blob) {
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
  }

  async applyWebglFilter(type: string) {
    try {
      await this.worker.doWebGL(type, this.imageBitmap, this.img?.naturalWidth || 0, this.img?.naturalHeight || 0, 0.6);
    }
    catch( err ) { 
      console.error(err);
    }
  }

  async enhance() {
    this.applyWebglFilter("brightness");
  }

  async blackAndWhite() {
    this.applyWebglFilter("desaturateLuminance");
  }

  async invert() {
    this.applyWebglFilter("negative");
  }

  async saturate() {
    this.applyWebglFilter("saturation");
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

        this.writeCanvas(blob);
      };


      this.img.src = URL.createObjectURL(blob1);
    })
  }

  async smartCrop() {
    this.applying = true;

    /*if (this.mainImg) {
      const blob = await this.worker.doAI(await window.createImageBitmap(this.mainImg), this.mainImg.naturalWidth, this.mainImg.naturalHeight);

      if (blob) {
        this.writeImage(blob);
      }
    }*/

    this.applying = false;
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

  checkDual() {
    if ((window as any).getWindowSegments) {
      if ((window as any).getWindowSegments().length <= 1) {
        return false;
      }
      else if ((window as any).getWindowSegments().length > 1) {
        return true;
      }
    }

    return false;
  }

  takePhoto() {
    this.takingPhoto = true;
  }

  closeCamera() {
    this.takingPhoto = false;
  }

  render() {
    return html`
    <app-header>

    ${this.imageOpened ? html`<fast-button class="headerAction" id="shareButton" @click="${() => this.shareImage()}">
        Share
        <ion-icon name="share-outline"></ion-icon>
      </fast-button>` : null}

      ${this.imageOpened ? html`<fast-button class="headerAction" id="revertButton" @click="${() => this.revert()}">
          revert
          <ion-icon name="refresh-outline"></ion-icon>
        </fast-button>` : null}
    
      ${this.imageOpened ? html`<fast-button id="saveButton" class="headerSaveButton headerAction" @click="${() => this.saveImage()}">
        Save Copy
        <ion-icon name="save-outline"></ion-icon>
      </fast-button>` : null}

      ${this.imageOpened ? html`<fast-button id="takePhotoButton" class="headerAction" @click="${() => this.takePhoto()}">
        Take Photo
        <ion-icon name="camera-outline"></ion-icon>
      </fast-button>` : null }
    
      <fast-button id="openButton" @click="${() => this.openImage()}">
        Open Image
        <ion-icon name="image-outline"></ion-icon>
      </fast-button>
      
    </app-header>
    
    <div>

    <fast-dialog id="example1" aria-label="Simple modal dialog" modal="true" ?hidden="${!this.handlingShortcut}">
      <h2>Choose an Image</h2>

      <p>Choose an image to start editing.</p>

      <fast-button id="openButton" @click="${() => this.openImage()}">
        Open Image
        <ion-icon name="image-outline"></ion-icon>
      </fast-button>
    </fast-dialog>

    ${this.takingPhoto ? html`<app-camera @got-file="${(event: any) => this.handleSharedImage(event.detail.file)}" @closed="${() => this.closeCamera()}"></app-camera>` : null }
    
      ${this.imageOpened ? html`

      ${this.applying ? html`<fast-progress min="0" max="100"></fast-progress>`: null}

      <div id="toolbar">
        <div id="fileInfo">
          <h3>
            ${this.imageBlob ? (this.imageBlob as File).name : "No File Name"}
          </h3>
    
          <p>Size: ${this.imageBlob ? this.formatBytes((this.imageBlob as File).size) : null}</p>
        </div>

        <div id="toolbarActions">
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

          <fast-button @click="${() => this.sepia()}">
            sepia
            <ion-icon name="bulb-outline"></ion-icon>
          </fast-button>

          <fast-button @click="${() => this.technicolor()}">
            technicolor
            <ion-icon name="bulb-outline"></ion-icon>
          </fast-button>

          <fast-button @click="${() => this.polaroid()}">
            polaroid
            <ion-icon name="bulb-outline"></ion-icon>
          </fast-button>
        </div>


            <div id="dualExtras">

              <fast-button @click="${() => this.shareImage()}">
                Share
                <ion-icon name="share-outline"></ion-icon>
              </fast-button>

              <fast-button @click="${() => this.revert()}">
                Revert
                <ion-icon name="refresh-outline"></ion-icon>
              </fast-button>

              <fast-button id="saveButton" @click="${() => this.saveImage()}">
                Save Copy
                <ion-icon name="save-outline"></ion-icon>
              </fast-button>

              <fast-button id="dualTakePhoto" @click="${() => this.takePhoto()}">
                Take Photo
                <ion-icon name="camera-outline"></ion-icon>
              </fast-button>
              
            </div>
      </div>
      ` : null}


      ${
        !this.imageOpened ? html`
        <img id="homePhoto" src="/assets/homePhoto.svg">

        <drag-drop @got-file="${(event: any) => this.handleSharedImage(event.detail.file)}">
          <div id="welcome">

            <div id="welcomeIntro">
                  <p>
                    Welcome! Make quick, simple edits to any image, tap "Open Image" to get started!
                  </p>

                  <div id="welcomeActions">
                    <fast-button id="welcomePhotoButton" @click="${() => this.takePhoto()}">
                      Take Photo
                      <ion-icon name="camera-outline"></ion-icon>
                    </fast-button>

                    <fast-button appearance="primary" id="openButton" @click="${() => this.openImage()}">
                      Open Image
                      <ion-icon name="image-outline"></ion-icon>
                    </fast-button>
                  </div>


            </div>
          </div>
        </drag-drop>
          ` : null}

      <drag-drop @got-file="${(event: any) => this.handleSharedImage(event.detail.file)}">
        <canvas id="onScreenCanvas"></canvas>
      </drag-drop>

      <pwa-install>Install SimpleEdit</pwa-install>
    </div>
  `
  }
}