import { LitElement, css, html, customElement, property } from 'lit-element';
import { clear } from 'idb-keyval';


@customElement('app-header')
export class AppHeader extends LitElement {

  @property({ type: String }) title: string = 'SimpleEdit';
  @property({ type: Boolean }) handlingSettings: boolean = false;

  static get styles() {
    return css`
      header {
        display: flex;
        justify-content: space-between;
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
        font-size: 18px;
        font-weight: bold;
        z-index: 999;
      }

      header div {
        display: flex;
      }

      #settingsDiv {
        margin-left: 8px;
      }

      #settingsDiv fast-button::part(control), #settingsHeader fast-button::part(control) {
        font-size: 1.4em;
      }

      #settingsActions {
        display: flex;
        flex-direction: column;
      }

      #settingsActions fast-button {
        margin-top: 8px;
      }

      #settingsDiv ion-icon {
        color: white;
      }

      #settingsHeader {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      #themeBlock {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      nav {
        width: 7em;
        display: flex;
        justify-content: space-between;
      }

      nav a {
        color: white;
        font-size: 18px;
        font-weight: bold;
      }

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

      @media(screen-spanning: single-fold-vertical) {
        fast-dialog::part(positioning-region) {
          left: calc(env(fold-left) + 34px);
          padding: 5% !important;
        }
      }

      @media(min-width: 1200px) {
        fast-dialog::part(positioning-region) {
          padding-left: 35%;
          padding-right: 35%;
        }

        fast-dialog::part(control) {
          padding-bottom: 3em;
        }
      }
    `;
  }

  constructor() {
    super();
  }

  openSettings() {
    this.handlingSettings = !this.handlingSettings;
  }

  about() {
    window.open("https://github.com/jgw96/simple-image-editor", "_blank");
    this.handlingSettings = false;
  }

  async clearStorage() {
    await clear();
    this.handlingSettings = false;
  }

  close() {
    this.handlingSettings = false;
  }

  render() {
    return html`
      <header>
        <h1>${this.title}</h1>
      
        <div>
          <slot></slot>
      
          <div id="settingsDiv">
            <fast-button appearance="lightweight" @click="${() => this.openSettings()}">
              <ion-icon name="settings-outline"></ion-icon>
            </fast-button>
          </div>
        </div>
      
      </header>
      
      <fast-dialog id="example1" aria-label="Settings dialog" modal="true" ?hidden="${!this.handlingSettings}">
        <div id="settingsHeader">
          <h2>Settings</h2>

          <fast-button appearance="lightweight" @click="${() => this.close()}">
            <ion-icon name="close-outline"></ion-icon>
          </fast-button>
        </div>
      
        <div id="settingsActions">
          <fast-button @click="${() => this.about()}">About</fast-button>

          <fast-button @click="${() => this.clearStorage()}">Clear Storage</fast-button>
        </div>
      </fast-dialog>
    `;
  }
}