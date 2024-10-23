import "./style.css";

const APP_NAME = "Saima's sticker sketchpad";
const app = document.querySelector<HTMLDivElement>("#app")!;

// document.title = APP_NAME;
// app.innerHTML = APP_NAME;
    // ^ commented to remove small title text, don't wanna delete yet in case its necessary l8r

// adding app title in h1 element
const header = document.createElement("h1");
header.innerHTML = APP_NAME;
app.append(header);

// adding a canvas
const canvas = document.createElement("canvas");
canvas.id = "canvas";
canvas.width = 256;
canvas.height = 256;
app.append(canvas);

const ctx = canvas.getContext("2d");

if (!ctx) {
    throw new Error("no canvas context");
}

ctx.fillStyle = "pink";
ctx.fillRect(10, 10, 150, 100);

// marker drawing on canvas
let isDrawing = false;
let x = 0;
let y = 0;

canvas.addEventListener("mousedown", (e: MouseEvent) => {
    x = e.offsetX;
    y = e.offsetY;
    isDrawing = true;
});

canvas.addEventListener("mousemove", (e: MouseEvent) => {
    if (isDrawing) {
        drawLine(ctx, x, y, e.offsetX, e.offsetY);
        x = e.offsetX;
        y = e.offsetY;
    }
});

canvas.addEventListener("mouseup", () => {
    isDrawing = false;
});

canvas.addEventListener("mouseout", () => {
    isDrawing = false;
});

function drawLine(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.closePath();
}

// add a clear button
const clearButton = document.createElement("button");
clearButton.innerHTML = "Clear Canvas";
clearButton.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});
app.append(clearButton);