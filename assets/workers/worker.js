// @ts-ignore
importScripts("https://unpkg.com/comlink/dist/umd/comlink.js");
importScripts("/assets/filters/webgl.js");
// importScripts("../../../dist/umd/comlink.js");

const obj = {
  offscreen: new OffscreenCanvas(40, 40),
  filter: new WebGLImageFilter(),

  async doWebGL(type, canvasImage, width, height, amount) {
    if (amount) {
      this.filter.addFilter(type, amount);
    }
    else {
      this.filter.addFilter(type);
    }

    this.offscreen.width = width;
    this.offscreen.height = height;

    offscreenContext = this.offscreen.getContext("2d");

    offscreenContext.drawImage(canvasImage, 0, 0, width, height);

    const filtered = this.filter.apply(this.offscreen);

    const blobToDraw = filtered.convertToBlob();

    this.filter.reset();

    return blobToDraw;
  },

  async getBlob(imageData, width, height) {
    this.offscreen.width = width;
    this.offscreen.height = height;

    offscreenContext = this.offscreen.getContext("2d");

    offscreenContext.drawImage(imageData, 0, 0, width, height);

    return this.offscreen.convertToBlob();
  }
};
// @ts-ignore
Comlink.expose(obj);