import "./style.css";

// creating new marker class
class MarkerLine {
    private points: { x: number; y:number }[];
    private thickness: number;
    private color: string;
    private rotation: number;

    constructor(initialX: number, initialY: number, thickness: number, color: string, rotation: number) {
        this.points = [{ x: initialX, y: initialY }];
        this.thickness = thickness;
        this.color = color;
        this.rotation = rotation;
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
            ctx.strokeStyle = this.color;
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
    private color: string;
    private rotation: number;

    constructor(x: number, y: number, thickness: number, color: string, rotation: number) {
        this.x = x;
        this.y = y;
        this.thickness = thickness;
        this.color = color;
        this.rotation = rotation;
    }

    update(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.beginPath();
        ctx.arc(0, 0, this.thickness / 2, 0, Math.PI * 2);
        ctx.fillStyle = this.color; 
        ctx.fill();
        // ctx.closePath();
        ctx.restore();
    }
}

class Sticker {
    private emoji: string;
    private x: number;
    private y: number;

    constructor(emoji: string, x: number, y: number) {
        this.emoji = emoji;
        this.x = x;
        this.y = y;
    }
    
    updatePosition(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.font = `${currentThickness * 3}px Arial`;
        ctx.fillText(this.emoji, this.x, this.y);
    }
}

const APP_NAME = "cute and kawaii sticker sketchpad";
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

const colorPicker = document.createElement("input");
colorPicker.type = "color";
colorPicker.value = "#000000";
app.append(colorPicker);

// marker drawing on canvas
let isDrawing = false;
let currentLine: MarkerLine | null = null;
let lines: (MarkerLine | Sticker)[] = [];
let redoStack: (MarkerLine | Sticker)[] = [];
let currentThickness = 1;
let toolPreview: ToolPreview | null = null;
let currentSticker: Sticker | null = null;

canvas.addEventListener("mousedown", (e: MouseEvent) => {
    if (currentSticker) {
        currentSticker.updatePosition(e.offsetX, e.offsetY);
        lines.push(currentSticker);
        currentSticker = null;
    } else {
        isDrawing = true;
        const selectedColor = getRandomColor();
        const randomRotation = getRandomRotation();
        currentLine = new MarkerLine(e.offsetX, e.offsetY, currentThickness, selectedColor, randomRotation);    
        toolPreview = new ToolPreview(e.offsetX, e.offsetY, currentThickness, selectedColor, randomRotation);
    }
});

canvas.addEventListener("mousemove", (e: MouseEvent) => {
    if (isDrawing && currentLine) {
        currentLine.drag(e.offsetX, e.offsetY);
        clearAndRedraw();
    } else if (!isDrawing) {
        if (currentSticker) {
            currentSticker.updatePosition(e.offsetX, e.offsetY);
        } else if (!toolPreview) {
            const randomColor = getRandomColor();
            const randomRotation = getRandomRotation();
            toolPreview = new ToolPreview(e.offsetX, e.offsetY, currentThickness, randomColor, randomRotation);
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

// STEP 9:
const stickerData = [
    { emoji: "😝" },
    { emoji: "🤪" },
    { emoji: "💖" },
    { emoji: "🎀" },
    { emoji: "🌸" },
    { emoji: "🐾" },
];

stickerData.forEach(({ emoji }) => {
    const button = document.createElement("button");
    button.innerHTML = emoji;
    button.addEventListener("click", (e) => {
        const randomColor = getRandomColor();
        const randomRotation = getRandomRotation();
        toolPreview = new ToolPreview(0, 0, currentThickness, randomColor, randomRotation);
        toolPreview.draw(ctx);
        currentSticker = new Sticker(emoji, 0, 0);
        currentLine = new MarkerLine(e.offsetX, e.offsetY, currentThickness, randomColor, randomRotation);
    });
    app.append(button);
});

// add custom sticker button
const customStickerButton = document.createElement("button");
customStickerButton.innerHTML = "Add a Custom Sticker";
customStickerButton.addEventListener("click", () => {
    const customEmoji = prompt("Enter a sticker emoji: ", "😊");
    if (customEmoji) {
        stickerData.push({ emoji: customEmoji });

        const button = document.createElement("button");
        button.innerHTML = customEmoji;
        button.addEventListener("click", (e: MouseEvent) => {
            canvas.dispatchEvent(new MouseEvent("mousemove", {
                clientX: e.clientX,
                clientY: e.clientY,
            }));
            currentSticker = new Sticker(customEmoji, 0, 0);
        });
        app.append(button);
    }
});
app.append(customStickerButton);

function clearAndRedraw() {
    if (!ctx) return; // had to add so ctx errors go away

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "pink";
    ctx.fillRect(10, 10, 150, 100); 

    for (const line of lines) {
        if(line instanceof MarkerLine) {
            line.display(ctx);
        } else if (line instanceof Sticker) {
            line.draw(ctx);
        }
    }

    if (currentLine) {
        currentLine.display(ctx);
    }

    if (!isDrawing && toolPreview) {
        toolPreview.draw(ctx);
    }

    if (currentSticker) {
        currentSticker.draw(ctx);
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

// STEP 11
const THIN_THICKNESS = 2;
const THICK_THICKNESS = 8;

// thin button
const thinButton = document.createElement("button");
thinButton.innerHTML = "Thin";
thinButton.addEventListener("click", () => {
    currentThickness = THIN_THICKNESS;
    const randomColor = getRandomColor();
    const randomRotation = getRandomRotation();
    setSelectedTool(thinButton);
    toolPreview = new ToolPreview(0, 0, currentThickness, randomColor, randomRotation);
    toolPreview.draw(ctx);
});
app.append(thinButton);

// thick button
const thickButton = document.createElement("button");
thickButton.innerHTML = "Thick";
thickButton.addEventListener("click", () => {
    currentThickness = THICK_THICKNESS;
    const randomColor = getRandomColor();
    const randomRotation = getRandomRotation();
    setSelectedTool(thickButton);
    toolPreview = new ToolPreview(0, 0, currentThickness, randomColor, randomRotation);
    toolPreview.draw(ctx);
});
app.append(thickButton);

// selected tool function
function setSelectedTool(selectedButton: HTMLButtonElement) {
    thinButton.classList.remove("selectedTool");
    thickButton.classList.remove("selectedTool");
    selectedButton.classList.add("selectedTool");
}

// STEP 10 export button
const exportButton = document.createElement("button");
exportButton.innerHTML = "Export as PNG";
exportButton.addEventListener("click", () => {
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = 1024;
    exportCanvas.height = 1024;
    const exportCtx = exportCanvas.getContext("2d");

    if (!exportCtx) {
        throw new Error("No export canvas context");
    }

    exportCtx.scale(4, 4);

    for (const line of lines) {
        if (line instanceof MarkerLine) {
            line.display(exportCtx);
        } else if (line instanceof Sticker) {
            line.draw(exportCtx);
        }
    }

    const anchor = document.createElement("a");
    anchor.href = exportCanvas.toDataURL("image/png");
    anchor.download = "sketchpad.png";
    anchor.click();
});
app.append(exportButton);

function getRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function getRandomRotation(): number {
    return Math.floor(Math.random() * 360);
}