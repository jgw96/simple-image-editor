// @ts-ignore
importScripts("https://unpkg.com/comlink/dist/umd/comlink.js");
// importScripts("../../../dist/umd/comlink.js");

const obj = {
  counter: 0,
  inc() {
    this.counter++;
  },

  blackAndWhite(d, width, height ) {
    for (var i = 0; i < d.length; i += 4) {
      let r = d[i];
      let g = d[i + 1];
      let b = d[i + 2];
      // CIE luminance for the RGB
      // The human eye is bad at seeing red and blue, so we de-emphasize them.
      let v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      d[i] = d[i + 1] = d[i + 2] = v
    }

    let image = new ImageData(d, width, height);

    return image;
  },

  invert(d, width, height ) {
    for (var i = 0; i < d.length; i += 4) {
      var r = d[i];
      var g = d[i + 1];
      var b = d[i + 2];
      var v = (0.2126 * r + 0.7152 * g + 0.0722 * b >= 90) ? 255 : 0;
      d[i] = d[i + 1] = d[i + 2] = v
    }

    let image = new ImageData(d, width, height);

    return image;
  },

  enhance(d, width, height ) {
    const adjustment = 40;

    for (var i = 0; i < d.length; i += 4) {
      d[i] += adjustment;
      d[i + 1] += adjustment;
      d[i + 2] += adjustment;
    }

    let image = new ImageData(d, width, height);

    return image;
  },

  saturate(d, width, height ) {
    const amount = 2;

    for (let i = 0; i < d.length; i += 4) {
      let r = (.213 + .787 * amount) * d[i]
          + (.715 - .715 * amount) * d[i + 1]
          + (.072 - .072 * amount) * d[i + 2];
      let g = (.213 - .213 * amount) * d[i]
          + (.715 + .285 * amount) * d[i + 1]
          + (.072 - .072 * amount) * d[i + 2];
      let b = (.213 - .213 * amount) * d[i];
          + (.715 - .715 * amount) * d[i + 1]
          + (.072 + .928 * amount) * d[i + 2];
      
      d[i] = r;
      d[i + 1] = g;
      d[i + 2] = b;
    }

    let image = new ImageData(d, width, height);

    return image;
  },

  async doAI(canvasImage) {
    const splitData = canvasImage.split(',')[1];
  
    const bytes = self.atob(splitData);
    const buf = new ArrayBuffer(bytes.length);
    let byteArr = new Uint8Array(buf);
  
    for (var i = 0; i < bytes.length; i++) {
      byteArr[i] = bytes.charCodeAt(i);
    }
  
    let data = null;
  
    try {
      const response = await fetch(`https://westus2.api.cognitive.microsoft.com/vision/v3.0/generateThumbnail?width=400&height=450&smartCropping=true`, {
        headers: {
          "Ocp-Apim-Subscription-Key": "d930861b5bba49e5939b843f9c4e5846",
          "Content-Type": "application/octet-stream"
        },
        method: "POST",
        body: byteArr
      });
      data = await response.blob();
  
      return data;
  
    } catch (error) {
      console.error(error);
      return error;
    }
  }
};
// @ts-ignore
Comlink.expose(obj);