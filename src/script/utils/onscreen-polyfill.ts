
import './webgl-online.js';

// @ts-ignore
let filter =  new WebGLImageFilter();

let canvas: HTMLCanvasElement | null = null;
let context: CanvasRenderingContext2D | null = null;

export function init(mainCanvas: HTMLCanvasElement, mainContext: CanvasRenderingContext2D) {
  console.log(mainCanvas, mainContext);
  canvas = mainCanvas;
  context = mainContext;
}

export async function doWebGL(type: string, canvasImage: ImageBitmap, width: number, height: number, amount: number) {
  console.log('calling dowebGL');
  if (amount) {
    filter.addFilter(type, amount);
  }
  else {
    filter.addFilter(type);
  }

  // offscreenContext.drawImage(canvasImage, 0, 0, width, height);

  drawImage(canvasImage, width, height);

  const filtered = filter.apply(canvas);

  // offscreenContext.drawImage(filtered, 0, 0, width, height);
  drawImage(filtered, width, height);

  filter.reset();
};

export function drawImage(image: any, width: number, height: number) {
  if (canvas && context) {
    canvas.width = width;
    canvas.height = height;

    console.log('calling draw image');
  
    context.drawImage(image, 0, 0, width, height, 0, 0, canvas.width, canvas.height);
  }
};

export function loadImage(imageData: any, width: number, height: number) {
  drawImage(imageData, width, height);
};