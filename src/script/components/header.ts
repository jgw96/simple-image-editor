import { LitElement, css, html, customElement, property } from 'lit-element';


@customElement('app-header')
export class AppHeader extends LitElement {

  @property({ type: String }) title: string = 'SimpleEdit';

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
        font-size: 20px;
        font-weight: normal;
      }

      header div {
        display: flex;
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
    `;
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <header>
        <h1>${this.title}</h1>

        <div>
          <slot></slot>
        </div>
      </header>
    `;
  }
}