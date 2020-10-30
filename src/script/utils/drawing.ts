let color = "black";
let globalDrawingContext: CanvasRenderingContext2D | null = null;

export async function changeColor(colorChosen: string) {
  console.log("colorChosen", colorChosen);
  color = colorChosen;

  if (globalDrawingContext) {
    globalDrawingContext.strokeStyle = color;
  }
}

export async function enablePen(drawingCanvas: HTMLCanvasElement, drawingContext: CanvasRenderingContext2D, imageBlob: any) {
  drawingCanvas.width = window.innerWidth;
  drawingCanvas.height = window.innerHeight;

  globalDrawingContext = drawingContext;
  drawingContext.lineWidth = 10;
  drawingContext.lineCap = 'round';
  drawingContext.strokeStyle = color;

  if (imageBlob) {
    const image1 = new Image();

    image1.onload = async () => {
      drawingContext.drawImage(image1, 0, 0, image1.naturalWidth, image1.naturalHeight, 0, 0, drawingCanvas.width, drawingCanvas.height);
    };


    image1.src = URL.createObjectURL(imageBlob);
  }

  const module = await import("./PointerTracker");
  const PointerTracker = module.default;

  new PointerTracker(drawingCanvas, {
    start(pointer: any, event: any) {
      console.log(pointer);
      event.preventDefault();
      return true;
    },
    move(previousPointers: any, changedPointers: any) {
      changedPointers.forEach((pointer: any) => {
        const previous = previousPointers.find((p: any) => p.id === pointer.id);

        if ((pointer.nativePointer as PointerEvent).buttons === 32 && (pointer.nativePointer as PointerEvent).button === -1) {
          // eraser button on pen

          drawingContext.globalCompositeOperation = 'destination-out';
          drawingContext.beginPath();
          drawingContext.moveTo(previous.clientX, previous.clientY);
          for (const point of pointer.getCoalesced()) {
            drawingContext.lineTo(point.clientX, point.clientY);
          }
          drawingContext.stroke();
        }
        else {
          // drawing
          drawingContext.globalCompositeOperation = 'source-over';

          drawingContext.beginPath();

          if (previous) {
            drawingContext.moveTo(previous.clientX, previous.pageY);
          }

          for (const point of pointer.getCoalesced()) {
            console.log(point);
            drawingContext.lineTo(point.clientX, point.clientY);
          }
          drawingContext.stroke();
        }

      })
    }
  });
}
