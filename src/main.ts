import "./style.css";

// creating new marker class
class MarkerLine {
    private points: { x: number; y:number }[];
    private thickness: number;

    constructor(initialX: number, initialY: number, thickness: number) {
        this.points = [{ x: initialX, y: initialY }];
        this.thickness = thickness;
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
            ctx.lineWidth = this.thickness;
            ctx.stroke();
            ctx.closePath();
        }
    }
}

// tool preview class
class ToolPreview {
    private x: number;
    private y: number;
    private thickness: number;

    constructor(x: number, y: number, thickness: number) {
        this.x = x;
        this.y = y;
        this.thickness = thickness;
    }

    update(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.thickness / 2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)"; 
        ctx.fill();
        ctx.closePath();
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
let currentLine: MarkerLine | null = null;
let lines: MarkerLine[] = [];
let redoStack: MarkerLine[] = [];
let currentThickness = 1;
let toolPreview: ToolPreview | null = null;

canvas.addEventListener("mousedown", (e: MouseEvent) => {
    isDrawing = true;
    currentLine = new MarkerLine(e.offsetX, e.offsetY, currentThickness);
});

canvas.addEventListener("mousemove", (e: MouseEvent) => {
    if (isDrawing && currentLine) {
        currentLine.drag(e.offsetX, e.offsetY);
        clearAndRedraw();
    } else if (!isDrawing) {
        if (!toolPreview) {
            toolPreview = new ToolPreview(e.offsetX, e.offsetY, currentThickness);
        } else {
            toolPreview.update(e.offsetX, e.offsetY);
        }
        clearAndRedraw();
    }
});

canvas.addEventListener("mouseup", () => {
    if (isDrawing && currentLine) {
        lines.push(currentLine);
        redoStack = [];
        isDrawing = false;
        currentLine = null;
        toolPreview = null;
        clearAndRedraw();
    }
});

canvas.addEventListener("mouseout", () => {
    isDrawing = false;
    toolPreview = null;
    clearAndRedraw();
});

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

    if (!isDrawing && toolPreview) {
        toolPreview.draw(ctx);
    }
}

// add a clear button
const clearButton = document.createElement("button");
clearButton.innerHTML = "Clear Canvas";
clearButton.addEventListener("click", () => {
    lines = [];
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
        clearAndRedraw();
    }
});
app.append(redoButton);

// thin button
const thinButton = document.createElement("button");
thinButton.innerHTML = "Thin";
thinButton.addEventListener("click", () => {
    currentThickness = 1;
    setSelectedTool(thinButton);
});
app.append(thinButton);

// thick button
const thickButton = document.createElement("button");
thickButton.innerHTML = "Thick";
thickButton.addEventListener("click", () => {
    currentThickness = 5;
    setSelectedTool(thickButton);
});
app.append(thickButton);

// selected tool function
function setSelectedTool(selectedButton: HTMLButtonElement) {
    thinButton.classList.remove("selectedTool");
    thickButton.classList.remove("selectedTool");
    selectedButton.classList.add("selectedTool");
}