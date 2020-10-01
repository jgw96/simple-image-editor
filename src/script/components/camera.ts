import { LitElement, css, html, customElement, internalProperty } from 'lit-element';

@customElement('app-camera')
export class AppCamera extends LitElement {

  @internalProperty() mediaStream: MediaStream | null = null;
  @internalProperty() imageCapture: any | null = null;

  static get styles() {
    return css`
      #camera {
        backdrop-filter: blur(10px);
        background: #181818c9;
        position: fixed;
        bottom: 0;
        top: 0;
        left: 0;
        right: 0;
        padding: 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-evenly;
        z-index: 9999;
      }

      #camera video {
        width: 100%;
        border-radius: 4px;
        min-height: 300px;
      }

      #camera #cameraActions, #camera #cameraActions fast-button {
        width: 100%;
      }

      #closeBlock {
        width: 100%;
        display: flex;
        justify-content: flex-end;
      }

      #closeBlock fast-button ion-icon {
        font-size: 2em;
      }

      @media(screen-spanning: single-fold-vertical) {
        #camera {
          right: calc(env(fold-left) + 33px);
        }
      }

      @media(min-width: 1200px) {
        #camera #cameraActions {
          display: flex;
          justify-content: center;
        }

        #camera #cameraActions fast-button {
          width: 40%;
        }

        #camera video {
          margin: 8em;
          margin-bottom: 4em;
          margin-top: 4em;
          border-radius: 4px;
          width: initial;
        }
      }
    `
  }

  constructor() {
    super();
  }

  async firstUpdated() {
    this.mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    const videoEl = this.shadowRoot?.querySelector("video");

    if (videoEl) {
      videoEl.srcObject = this.mediaStream;

      this.setupCamera();
    }
  }

  setupCamera() {
    const track = this.mediaStream?.getTracks()[0];
    this.imageCapture = new (window as any).ImageCapture(track);
  }

  async takePicture() {
    const blob = await this.imageCapture.takePhoto();
    console.log(blob);

    const tracks = this.mediaStream?.getTracks();

    tracks?.forEach((track) => {
      track.stop();
    })

    let event = new CustomEvent('got-file', {
      detail: {
        file: blob
      }
    });
    this.dispatchEvent(event);
  }

  close() {
    let event = new CustomEvent('closed', {
    });
    this.dispatchEvent(event);
  }

  render() {
    return html`
      <div id="camera">
        <div id="closeBlock">
          <fast-button @click="${() => this.close()}" appearance="lightweight">
            <ion-icon name="close-outline"></ion-icon>
          </fast-button>
        </div>
        <video autoplay></video>
      
        <div id="cameraActions">
          <fast-button @click="${() => this.takePicture()}">
            Take Picture
          </fast-button>
        </div>
      </div>
    `
  }

}