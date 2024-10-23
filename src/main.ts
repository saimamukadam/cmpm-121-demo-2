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
// let x = 0;
// let y = 0;
let points: Array<Array<{ x: number, y: number }>> = [[]]; 
let currentLine: { x: number, y: number }[] = [];

canvas.addEventListener("mousedown", (e: MouseEvent) => {
    // x = e.offsetX;
    // y = e.offsetY;
    isDrawing = true;
    currentLine = [{ x: e.offsetX, y: e.offsetY }];
});

canvas.addEventListener("mousemove", (e: MouseEvent) => {
    if (isDrawing) {
        // drawLine(ctx, x, y, e.offsetX, e.offsetY);
        // x = e.offsetX;
        // y = e.offsetY;
        currentLine.push({ x: e.offsetX, y: e.offsetY });
        const event = new CustomEvent("drawing changed");
        canvas.dispatchEvent(event);
    }
});

canvas.addEventListener("mouseup", () => {
    // isDrawing = false;
    if (isDrawing) {
        points.push(currentLine);
        isDrawing = false;
    }
});

canvas.addEventListener("mouseout", () => {
    isDrawing = false;
});

canvas.addEventListener("drawing changed", () => {
    clearAndRedraw();
});

function clearAndRedraw() {
    if (!ctx) return; // had to add so ctx errors go away

    ctx.clearRect(0,0, canvas.width, canvas.height);
    ctx.fillStyle = "pink";
    ctx.fillRect(10, 10, 150, 100); 

    for (const line of points) {
        if (line.length > 0) {
            ctx.beginPath();
            ctx.moveTo(line[0].x, line[0].y);
            for (const point of line) {
                ctx.lineTo(point.x, point.y);
            }
            ctx.strokeStyle = "black";
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.closePath();
        }
    }
}

// function drawLine(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
//     ctx.beginPath();
//     ctx.strokeStyle = "black";
//     ctx.lineWidth = 1;
//     ctx.moveTo(x1, y1);
//     ctx.lineTo(x2, y2);
//     ctx.stroke();
//     ctx.closePath();
// }

// add a clear button
const clearButton = document.createElement("button");
clearButton.innerHTML = "Clear Canvas";
clearButton.addEventListener("click", () => {
    points = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});
app.append(clearButton);