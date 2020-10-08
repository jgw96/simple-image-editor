
import { LitElement, css, html, customElement, internalProperty } from 'lit-element';

import { get } from 'idb-keyval';
import { FileSystemHandle } from 'browser-nativefs';

@customElement('app-gallery')
export class AppGallery extends LitElement {

  @internalProperty() images: any[] | null = null;
  @internalProperty() handlingImage: boolean = false;
  @internalProperty() previewImageHandle: FileSystemHandle | null = null;
  @internalProperty() previewImageURL: string | null = null;

  static get styles() {
    return css`

      #imageActions {
        display: flex;
        justify-content: flex-end;  
        background: var(--app-color-primary);
        padding-right: 10px;
        padding: 8px;
        align-items: center;

        border-radius: 4px 4px 0px 0;
      }

      header {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        padding-left: 16px;
        padding-right: 6px;
        background: var(--app-color-primary);
        color: white;
        height: 3.6em;
      }

      header h1 {
        margin-top: 0;
        margin-bottom: 0;
        margin-left: 8px;
        font-size: 18px;
        font-weight: bold;
      }

      header fast-anchor ion-icon {
        font-size: 1.8em;
      }

      ul {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
        gap: 16px;
        margin: 0px;
        padding: 4em 14px 14px;
        overflow: hidden scroll;
        height: 88vh;
        position: absolute;
        top: 0px;
        z-index: -1;
        width: 98%;
      }

      ul li {
        border-radius: 6px;
      }

      ul li img {
        width: 100%;
        object-fit: cover;

        border-radius: 4px;
      }

      #previewDialog::part(control) {
        width: 80%;
        height: 80%;
        overflow-y: scroll;
      }

      #previewImage {
        width: 100%;
        object-fit: contain;
      }

      #previewActions {
        display: flex;
        justify-content: flex-end;
        padding: 10px;
      }

      #previewView {
        margin-right: 10px;
      }
    `
  }

  constructor() {
    super();
  }

  async firstUpdated() {
    await this.getImages();
  }

  async getImages() {
    const latest: Array<any> = await get('savedImages');

    if (latest && latest.length > 0) {
      this.images = latest;
    }
  }

  async openImage(handle: any) {
    const existingPerm = await handle.queryPermission({
      writable: false
    });

    if (existingPerm === "granted") {
      const blob = await handle.getFile();
      this.handleImage(blob);
    }
    else {
      const request = await handle.requestPermission({
        writable: false
      })

      console.log(request);

      if (request === "granted") {
        this.previewImageHandle = handle;

        const blob = await handle.getFile();
        console.log(blob);

        this.handleImage(blob);
      }
    }
  }

  async handleImage(blob: Blob) {
    console.log(blob);

    this.handlingImage = true;

    this.previewImageURL = URL.createObjectURL(blob);
  }

  closePreview() {
    this.handlingImage = false;


    if (this.previewImageURL) {
      URL.revokeObjectURL(this.previewImageURL);
    }
  }


  render() {
    return html`
    <div>
      <header>
        <fast-anchor href="/" appearance="lightweight">
          <ion-icon name="arrow-back-outline"></ion-icon>
        </fast-anchor>
        <h1>Gallery</h1>
      </header>
    
      <fast-dialog id="previewDialog" class="example-dialog" aria-label="Simple modal dialog" modal="true"
        ?hidden="${!this.handlingImage}">
    
        <div id="previewActions">
    
          <fast-button @click="${() => this.closePreview()}" id="previewClose">
            Close
    
            <ion-icon name="close-outline"></ion-icon>
          </fast-button>
        </div>
    
        ${this.previewImageURL ? html`<img id="previewImage" .src="${this.previewImageURL}">` : null}
      </fast-dialog>
    
      <ul>
        ${(
        this.images ? this.images.map((image) => {
        return html`
        <li>
          <div id="imageActions">
            <fast-button @click="${() => this.openImage(image.handle)}" id="previewView" appearance="outline">
              View
    
              <ion-icon name="image-outline"></ion-icon>
            </fast-button>
    
            <fast-button appearance="outline">
              Delete
              <ion-icon name="trash-outline"></ion-icon>
            </fast-button>
          </div>
    
          <img src="${URL.createObjectURL(image.preview)}">
        </li>
        `
        }) : null)}
      </ul>
    </div>
    `
  }
}