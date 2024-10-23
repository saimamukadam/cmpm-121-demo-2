import "./style.css";

const APP_NAME = "Saima's sticker sketchpad";
const app = document.querySelector<HTMLDivElement>("#app")!;

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
let points: Array<Array<{ x: number, y: number }>> = [[]]; 
let currentLine: { x: number, y: number }[] = [];
let redoStack: Array<Array<{ x: number, y: number }>> = [];

canvas.addEventListener("mousedown", (e: MouseEvent) => {
    isDrawing = true;
    currentLine = [{ x: e.offsetX, y: e.offsetY }];
});

canvas.addEventListener("mousemove", (e: MouseEvent) => {
    if (isDrawing) {
        currentLine.push({ x: e.offsetX, y: e.offsetY });
        const event = new CustomEvent("drawing changed");
        canvas.dispatchEvent(event);
    }
});

canvas.addEventListener("mouseup", () => {
    if (isDrawing) {
        points.push(currentLine);
        redoStack = [];
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

    ctx.clearRect(0, 0, canvas.width, canvas.height);
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

// add a clear button
const clearButton = document.createElement("button");
clearButton.innerHTML = "Clear Canvas";
clearButton.addEventListener("click", () => {
    points = [];
    redoStack = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});
app.append(clearButton);

// add an undo button
const undoButton = document.createElement("button");
undoButton.innerHTML = "Undo";
undoButton.addEventListener("click", () => {
    if (points.length > 0) {
        const lastLine = points.pop();
        if (lastLine) {
            redoStack.push(lastLine);
        }
        const event = new CustomEvent("drawing changed");
        canvas.dispatchEvent(event);
    }
});
app.append(undoButton);

// add a redo button
const redoButton = document.createElement("button");
redoButton.innerHTML = "Redo";
redoButton.addEventListener("click", () => {
    if (redoStack.length > 0) {
        const lastRedo = redoStack.pop();
        if (lastRedo) {
            points.push(lastRedo);
        }
        const event = new CustomEvent("drawing changed");
        canvas.dispatchEvent(event);
    }
});
app.append(redoButton);