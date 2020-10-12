// @ts-ignore
importScripts("https://unpkg.com/comlink/dist/umd/comlink.js");
importScripts("/assets/filters/webgl.js");
// importScripts("../../../dist/umd/comlink.js");

let offscreenContext = null;
let canvas = null;

onmessage = function (evt) {
  if (evt.data.canvas) {
    canvas = evt.data.canvas;
    offscreenContext = canvas.getContext("2d");
  }

  // ... some drawing using the gl context ...
};

const obj = {
  filter: new WebGLImageFilter(),

  async doWebGL(type, canvasImage, width, height, amount) {
    if (amount) {
      this.filter.addFilter(type, amount);
    }
    else {
      this.filter.addFilter(type);
    }

    canvas.width = width;
    canvas.height = height;

    offscreenContext.drawImage(canvasImage, 0, 0, width, height);

    const filtered = this.filter.apply(canvas);

    offscreenContext.drawImage(filtered, 0, 0, width, height);

    this.filter.reset();
  },

  loadImage(imageData, width, height) {
    canvas.width = width;
    canvas.height = height;
    
    offscreenContext.drawImage(imageData, 0, 0, width, height);
  },

  async getBlob(imageData, width, height) {
    this.offscreen.width = width;
    this.offscreen.height = height;

    offscreenContext = this.offscreen.getContext("2d");

    offscreenContext.drawImage(imageData, 0, 0, width, height);

    return this.offscreen.convertToBlob();
  },

  blobToDataURL(blob, callback) {
    var a = new FileReader();
    a.onload = function (e) { callback(e.target.result); }
    a.readAsDataURL(blob);
  },

  async doAI(imageData, width, height) {
    this.offscreen.width = width;
    this.offscreen.height = height;

    offscreenContext = this.offscreen.getContext("2d");

    offscreenContext.drawImage(imageData, 0, 0, width, height);

    const blob = await this.offscreen.convertToBlob();

    return new Promise((resolve, reject) => {
      this.blobToDataURL(blob, async (dataURL) => {
        const splitData = dataURL.split(',')[1];

        const bytes = self.atob(splitData);
        const buf = new ArrayBuffer(bytes.length);
        let byteArr = new Uint8Array(buf);

        for (var i = 0; i < bytes.length; i++) {
          byteArr[i] = bytes.charCodeAt(i);
        }

        let data = null;

        try {
          const response = await fetch(`https://westus2.api.cognitive.microsoft.com/vision/v3.0/generateThumbnail?width=400&height=400&smartCropping=true`, {
            headers: {
              "Ocp-Apim-Subscription-Key": "d930861b5bba49e5939b843f9c4e5846",
              "Content-Type": "application/octet-stream"
            },
            method: "POST",
            body: byteArr
          });
          data = await response.blob();

          console.log(data);

          if (data.type !== "application/json") {
            resolve(data);
          }

        } catch (error) {
          console.error(error);
          reject(error);
        }
      })
    })
  }
};
// @ts-ignore
Comlink.expose(obj);