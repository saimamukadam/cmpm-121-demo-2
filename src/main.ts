import "./style.css";

// creating new marker class
class MarkerLine {
    private points: { x: number; y:number }[];

    constructor(initialX: number, initialY:number) {
        this.points = [{ x: initialX, y: initialY}];
    }

    drag(x: number, y: number) {
        this.points.push({ x,y });
    }

    display(ctx: CanvasRenderingContext2D) {
        if (this.points.length > 0) {
            ctx.beginPath();
            ctx.moveTo(this.points[0].x, this.points[0].y);
            for (const point of this.points) {
                ctx.lineTo(point.x, point.y);
            }
            ctx.strokeStyle = "black";
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.closePath();
        }
    }
}

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
// let points: Array<Array<{ x: number, y: number }>> = [[]]; 
// let currentLine: { x: number, y: number }[] = [];
let currentLine: MarkerLine | null = null;
let lines: MarkerLine[] = [];
//let redoStack: Array<Array<{ x: number, y: number }>> = [];
let redoStack: MarkerLine[] = [];

canvas.addEventListener("mousedown", (e: MouseEvent) => {
    isDrawing = true;
    // currentLine = [{ x: e.offsetX, y: e.offsetY }];
    currentLine = new MarkerLine(e.offsetX, e.offsetY);
});

canvas.addEventListener("mousemove", (e: MouseEvent) => {
    if (isDrawing && currentLine) {
        // currentLine.push({ x: e.offsetX, y: e.offsetY });
        currentLine.drag(e.offsetX, e.offsetY);
        // const event = new CustomEvent("drawing changed");
        // canvas.dispatchEvent(event);
        clearAndRedraw();
    }
});

canvas.addEventListener("mouseup", () => {
    if (isDrawing && currentLine) {
        lines.push(currentLine);
        redoStack = [];
        isDrawing = false;
        currentLine = null;
    }
});

canvas.addEventListener("mouseout", () => {
    isDrawing = false;
});

//canvas.addEventListener("drawing changed", () => {
  //  clearAndRedraw();
//});

function clearAndRedraw() {
    if (!ctx) return; // had to add so ctx errors go away

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "pink";
    ctx.fillRect(10, 10, 150, 100); 

    for (const line of lines) {
        line.display(ctx);
    }

    if (currentLine) {
        currentLine.display(ctx);
    }
}

// add a clear button
const clearButton = document.createElement("button");
clearButton.innerHTML = "Clear Canvas";
clearButton.addEventListener("click", () => {
    lines = [];
    //points = [];
    redoStack = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});
app.append(clearButton);

// add an undo button
const undoButton = document.createElement("button");
undoButton.innerHTML = "Undo";
undoButton.addEventListener("click", () => {
    if (lines.length > 0) {
        const lastLine = lines.pop();
        if (lastLine) {
            redoStack.push(lastLine);
        }
        //const event = new CustomEvent("drawing changed");
        //canvas.dispatchEvent(event);
        clearAndRedraw();
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
            lines.push(lastRedo);
        }
        //const event = new CustomEvent("drawing changed");
        //canvas.dispatchEvent(event);
        clearAndRedraw();
    }
});
app.append(redoButton);