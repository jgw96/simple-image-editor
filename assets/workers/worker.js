// @ts-ignore
importScripts("https://unpkg.com/comlink/dist/umd/comlink.js");
importScripts("/assets/filters/webgl.js");
// importScripts("../../../dist/umd/comlink.js");

let offscreenContext = null;
let canvas = null;

let orgWidth = null;
let orgHeight = null;

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

    // offscreenContext.drawImage(canvasImage, 0, 0, width, height);

    this.drawImage(canvasImage, width, height);

    const filtered = this.filter.apply(canvas);

    // offscreenContext.drawImage(filtered, 0, 0, width, height);
    this.drawImage(filtered, width, height);

    this.filter.reset();
  },

  drawImage(image, width, height) {
    /*orgWidth = width;
    orgHeight = height;

    offscreenContext.clearRect(0, 0, canvas.width, canvas.height);

    const imageAspectRatio = image.width / image.height;
    const canvasAspectRatio = canvas.width / canvas.height;

    let renderableHeight, renderableWidth, xStart, yStart;

    // If image's aspect ratio is less than canvas's we fit on height
    // and place the image centrally along width
    if (imageAspectRatio < canvasAspectRatio) {
      renderableHeight = canvas.height;
      renderableWidth = image.width * (renderableHeight / image.height);
      xStart = (canvas.width - renderableWidth) / 2;
      yStart = 0;
    }

    // If image's aspect ratio is greater than canvas's we fit on width
    // and place the image centrally along height
    else if (imageAspectRatio > canvasAspectRatio) {
      renderableWidth = canvas.width
      renderableHeight = image.height * (renderableWidth / image.width);
      xStart = 0;
      yStart = (canvas.height - renderableHeight) / 2;
    }

    // Happy path - keep aspect ratio
    else {
      renderableHeight = canvas.height;
      renderableWidth = canvas.width;
      xStart = 0;
      yStart = 0;
    }

    offscreenContext.drawImage(image, xStart, yStart, renderableWidth, renderableHeight);*/
    canvas.width = image.width;
    canvas.height = image.height;

    offscreenContext.drawImage(image, 0, 0);
  },

  loadImage(imageData, width, height) {
    this.drawImage(imageData, width, height);
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

  async doManualCrop(image, initialWidth, initialHeight, width, height) {
    offscreenContext.clearRect(0, 0, canvas.width, canvas.height);

    /*offscreenContext.drawImage(image, 0, 0, initialWidth, initialHeight, 
      0, 0, width, height);*/

    offscreenContext.drawImage(image, 0, 0, width, height,
      0, 0, initialWidth, initialHeight);

    return canvas.convertToBlob();
  },

  async doAI() {
    const blob = await canvas.convertToBlob();

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
          const response = await fetch(`https://westus2.api.cognitive.microsoft.com/vision/v3.1/generateThumbnail?width=200&height=200&smartCropping=true`, {
            headers: {
              "Ocp-Apim-Subscription-Key": "d930861b5bba49e5939b843f9c4e5846",
              "Content-Type": "application/octet-stream"
            },
            method: "POST",
            body: byteArr
          });
          data = await response.blob();

          if (data.type !== "application/json") {
            resolve(data);
          }

        } catch (error) {
          console.error(error, error.message);
          reject(error);
        }
      })
    })
  }
};
// @ts-ignore
Comlink.expose(obj);