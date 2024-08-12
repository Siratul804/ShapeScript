import React, { useRef, useState, useEffect } from "react";
import "./Draw.css";

const DrawingCanvas = () => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [drawnShapes, setDrawnShapes] = useState([]);
  const [color, setColor] = useState("#000000"); // Default color is black
  const [shape, setShape] = useState("rectangle"); // Default shape is rectangle
  const [tool, setTool] = useState("draw"); // Default tool is draw

  // Initialize the canvas context
  const prepareCanvas = () => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight * 0.6;
    canvas.style.border = "1px solid #000";

    const context = canvas.getContext("2d");
    context.lineCap = "round";
    context.strokeStyle = color;
    context.lineWidth = 5;
    contextRef.current = context;
  };

  // Redraw the canvas after updating shapes or color
  const redrawCanvas = () => {
    const context = contextRef.current;
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    drawnShapes.forEach((shape) => {
      context.strokeStyle = shape.color;
      if (shape.type === "rectangle") {
        context.strokeRect(shape.x, shape.y, shape.width, shape.height);
      } else if (shape.type === "circle") {
        context.beginPath();
        context.arc(
          shape.x + shape.radius,
          shape.y + shape.radius,
          shape.radius,
          0,
          2 * Math.PI
        );
        context.stroke();
      } else if (shape.type === "triangle") {
        context.beginPath();
        context.moveTo(shape.x, shape.y + shape.height);
        context.lineTo(shape.x + shape.width / 2, shape.y);
        context.lineTo(shape.x + shape.width, shape.y + shape.height);
        context.closePath();
        context.stroke();
      }
    });
  };

  // Start drawing or erasing
  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    setStartX(offsetX);
    setStartY(offsetY);
    setIsDrawing(true);
  };

  // Check if the eraser is intersecting with a shape
  const eraseShape = (x, y) => {
    const eraserSize = 10; // Adjust the size as needed
    const updatedShapes = drawnShapes.filter((shape) => {
      if (shape.type === "rectangle") {
        return !(
          x >= shape.x - eraserSize &&
          x <= shape.x + shape.width + eraserSize &&
          y >= shape.y - eraserSize &&
          y <= shape.y + shape.height + eraserSize
        );
      } else if (shape.type === "circle") {
        const distance = Math.sqrt(
          (x - (shape.x + shape.radius)) ** 2 +
            (y - (shape.y + shape.radius)) ** 2
        );
        return distance > shape.radius + eraserSize;
      } else if (shape.type === "triangle") {
        const withinBounds =
          x >= shape.x - eraserSize &&
          x <= shape.x + shape.width + eraserSize &&
          y >= shape.y - eraserSize &&
          y <= shape.y + shape.height + eraserSize;

        if (!withinBounds) return true;

        const p1 = { x: shape.x, y: shape.y + shape.height };
        const p2 = { x: shape.x + shape.width / 2, y: shape.y };
        const p3 = { x: shape.x + shape.width, y: shape.y + shape.height };

        const isPointInTriangle = (px, py, p1, p2, p3) => {
          const area =
            0.5 *
            (-p2.y * p3.x +
              p1.y * (-p2.x + p3.x) +
              p1.x * (p2.y - p3.y) +
              p2.x * p3.y);
          const sign = area < 0 ? -1 : 1;
          const s =
            (p1.y * p3.x -
              p1.x * p3.y +
              (p3.y - p1.y) * px +
              (p1.x - p3.x) * py) *
            sign;
          const t =
            (p1.x * p2.y -
              p1.y * p2.x +
              (p1.y - p2.y) * px +
              (p2.x - p1.x) * py) *
            sign;
          return s >= 0 && t >= 0 && s + t <= area * 2;
        };

        return !isPointInTriangle(x, y, p1, p2, p3);
      }
      return true;
    });

    setDrawnShapes(updatedShapes);
    redrawCanvas();
  };

  // Finish drawing or erasing
  const finishDrawing = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;

    if (tool === "draw") {
      let newShape;
      contextRef.current.strokeStyle = color;

      if (shape === "rectangle") {
        newShape = {
          x: startX,
          y: startY,
          width: offsetX - startX,
          height: offsetY - startY,
          type: "rectangle",
          color,
        };
        contextRef.current.strokeRect(
          startX,
          startY,
          offsetX - startX,
          offsetY - startY
        );
      } else if (shape === "circle") {
        const radius =
          Math.sqrt((offsetX - startX) ** 2 + (offsetY - startY) ** 2) / 2;
        newShape = { x: startX, y: startY, radius, type: "circle", color };
        contextRef.current.beginPath();
        contextRef.current.arc(
          startX + (offsetX - startX) / 2,
          startY + (offsetY - startY) / 2,
          radius,
          0,
          2 * Math.PI
        );
        contextRef.current.stroke();
      } else if (shape === "triangle") {
        newShape = {
          x: startX,
          y: startY,
          width: offsetX - startX,
          height: offsetY - startY,
          type: "triangle",
          color,
        };
        contextRef.current.beginPath();
        contextRef.current.moveTo(startX, startY + offsetY - startY);
        contextRef.current.lineTo(startX + (offsetX - startX) / 2, startY);
        contextRef.current.lineTo(
          startX + (offsetX - startX),
          startY + offsetY - startY
        );
        contextRef.current.closePath();
        contextRef.current.stroke();
      }

      setDrawnShapes((prevShapes) => [...prevShapes, newShape]);
    } else if (tool === "eraser") {
      eraseShape(offsetX, offsetY);
    }

    setIsDrawing(false);
  };

  // Generate HTML Code
  const generateHTMLCode = () => {
    const htmlCode = drawnShapes
      .map((shape) => {
        if (shape.type === "rectangle") {
          return `<div style="position:absolute; left:${shape.x}px; top:${shape.y}px; width:${shape.width}px; height:${shape.height}px; border: 1px solid ${shape.color};"></div>`;
        } else if (shape.type === "circle") {
          return `<div style="position:absolute; left:${shape.x}px; top:${
            shape.y
          }px; width:${shape.radius * 2}px; height:${
            shape.radius * 2
          }px; border-radius: 50%; border: 1px solid ${shape.color};"></div>`;
        } else if (shape.type === "triangle") {
          return `<div style="position:absolute; left:${shape.x}px; top:${
            shape.y
          }px; width: 0; height: 0; border-left: ${
            shape.width / 2
          }px solid transparent; border-right: ${
            shape.width / 2
          }px solid transparent; border-bottom: ${shape.height}px solid ${
            shape.color
          };"></div>`;
        }
        return "";
      })
      .join("\n");
    return htmlCode;
  };

  // Handle color change
  const handleColorChange = (e) => {
    setColor(e.target.value);
  };

  // Handle shape change
  const handleShapeChange = (e) => {
    setShape(e.target.value);
  };

  // Handle tool change
  const handleToolChange = (e) => {
    setTool(e.target.value);
  };

  // Prepare the canvas on component mount and color change
  useEffect(() => {
    prepareCanvas();
  }, []);

  useEffect(() => {
    redrawCanvas();
  }, [color, drawnShapes]);

  return (
    <div className="container">
      <section style={{ display: "flex", justifyContent: "space-evenly" }}>
        <div
          style={{
            paddingLeft: "6vh",
            paddingRight: "6vh",
            paddingBottom: "3vh",
          }}
        >
          <h3>Select Tool:</h3>
          <select onChange={handleToolChange} value={tool}>
            <option value="draw">Draw</option>
            <option value="eraser">Eraser</option>
          </select>
        </div>
        <div
          style={{
            paddingLeft: "6vh",
            paddingRight: "6vh",
            paddingBottom: "3vh",
          }}
        >
          <h3>Select Shape:</h3>
          <select onChange={handleShapeChange} value={shape}>
            <option value="rectangle">Rectangle</option>
            <option value="circle">Circle</option>
            <option value="triangle">Triangle</option>
          </select>
        </div>
        <div
          style={{
            paddingLeft: "6vh",
            paddingRight: "6vh",
            paddingBottom: "3vh",
          }}
        >
          <h3>Select Color:</h3>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <input
              type="color"
              onChange={handleColorChange}
              value={color}
              style={{ height: "6vh", width: "12vh" }}
            />
          </div>
          <br />
        </div>
      </section>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseUp={finishDrawing}
      />
      <h3>Generated HTML Code:</h3>
      <pre>{generateHTMLCode()}</pre>
    </div>
  );
};

export default DrawingCanvas;
