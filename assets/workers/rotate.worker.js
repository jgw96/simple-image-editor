importScripts("https://unpkg.com/comlink/dist/umd/comlink.js");

const rotate = {
    maybeInstantiateStreaming: async (path, ...opts) => {
        // Start the download asap.
        const f = fetch(path);
        try {
            // This will throw either if `instantiateStreaming` is
            // undefined or the `Content-Type` header is wrong.
            return WebAssembly.instantiateStreaming(
                f,
                ...opts
            );
        } catch (_e) {
            // If it fails for any reason, fall back to downloading
            // the entire module as an ArrayBuffer.
            return WebAssembly.instantiate(
                await f.then(f => f.arrayBuffer()),
                ...opts
            );
        }
    },

    rotateImageOffscreen: async (width, height, im) => {
        const canvas = new OffscreenCanvas(width, height);
        const ctx = canvas.getContext("2d");
        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(im, 0, 0, width, height);

        const bytesPerImage = width * height * 4;
        const minimumMemorySize = bytesPerImage * 2 + 4;
        const pagesNeeded = Math.ceil(minimumMemorySize / (64 * 1024));

        let memory = new WebAssembly.Memory({ initial: 256 });
        const { instance } = await rotate.maybeInstantiateStreaming(
            '/assets/workers/optimized.wasm',
            {
                env: { memory, abort: () => console.log("Abort!") }
            }
        );

        if (instance.exports.memory) {
            memory = instance.exports.memory;
        }
        memory.grow(pagesNeeded);


        new Uint8ClampedArray(memory.buffer, 4).set(ctx.getImageData(0, 0, width, height).data);

        instance.exports.rotate(
            width,
            height,
            90
        );

        const resultData = new Uint8ClampedArray(
            memory.buffer,
            width * height * 4,
            width * height * 4
        );

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.putImageData(new ImageData(resultData, canvas.height, canvas.width), width / 8, 0);

        const blob = await canvas.convertToBlob();
        return blob;
    },

    rotateImage: async (imageData, width, height) => {
        const bytesPerImage = width * height * 4;
        const minimumMemorySize = bytesPerImage * 2 + 4;
        const pagesNeeded = Math.ceil(minimumMemorySize / (64 * 1024));

        let memory = new WebAssembly.Memory({ initial: 256 });
        const { instance } = await rotate.maybeInstantiateStreaming(
            '/assets/workers/optimized.wasm',
            {
                env: { memory, abort: () => console.log("Abort!") }
            }
        );

        if (instance.exports.memory) {
            memory = instance.exports.memory;
        }
        memory.grow(pagesNeeded);


        new Uint8ClampedArray(memory.buffer, 4).set(imageData);

        instance.exports.rotate(
            width,
            height,
            90
        );

        const resultData = new Uint8ClampedArray(
            memory.buffer,
            width * height * 4,
            width * height * 4
        );

        return resultData;
    },

}

Comlink.expose(rotate);