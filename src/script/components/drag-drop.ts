import { LitElement, css, html, customElement } from 'lit-element';


@customElement('drag-drop')
export class DragDrop extends LitElement {

    static get styles() {
        return css`
        #dragdrop {
            display: flex;
            justify-content: center;
            align-items: center;
        }

        @media(max-width: 1000px) {
            #dragdrop {
                height: 90vh;
            }
        }

        @media(screen-spanning: single-fold-vertical) {
            #dragdrop {
                width: 48.8%;
                height: 90vh;
            }
        }
        `
    }

    constructor() {
        super();
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop
    dropHandler(ev: any) {
        console.log('File(s) dropped', ev);

        // Prevent default behavior (Prevent file from being opened)
        ev.preventDefault();

        if (ev.dataTransfer.items) {
            // Use DataTransferItemList interface to access the file(s)
            for (let i = 0; i < ev.dataTransfer.items.length; i++) {
                // If dropped items aren't files, reject them
                if (ev.dataTransfer.items[i].kind === 'file') {
                    let file = ev.dataTransfer.items[i].getAsFile();
                    console.log('... file[' + i + '].name = ' + file.name);

                    let event = new CustomEvent('got-file', {
                        detail: {
                            file: file
                        }
                    });
                    this.dispatchEvent(event);
                }
            }
        } else {
            // Use DataTransfer interface to access the file(s)
            for (let i = 0; i < ev.dataTransfer.files.length; i++) {
                console.log('... file[' + i + '].name = ' + ev.dataTransfer.files[i].name);

                let event = new CustomEvent('got-file', {
                    detail: {
                        file: ev.dataTransfer.files[i]
                    }
                });
                this.dispatchEvent(event);

                return;
            }
        }
    }

    dragOverHandler(ev: any) {
        console.log('File(s) in drop zone');

        // Prevent default behavior (Prevent file from being opened)
        ev.preventDefault();
        
    }

    render() {
        return html`
        <div @drop="${(event: any) => this.dropHandler(event)}" @dragover="${(event: any) => this.dragOverHandler(event)}" id="dragdrop">
            <slot></slot>
        </div>
        `;
    }
}