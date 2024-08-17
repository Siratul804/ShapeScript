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

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    setStartX(offsetX);
    setStartY(offsetY);
    setIsDrawing(true);
  };

  const drawShape = ({ nativeEvent }) => {
    if (!isDrawing) return;

    const { offsetX, offsetY } = nativeEvent;
    const context = contextRef.current;

    // Clear the canvas before redrawing
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Redraw all shapes that have been drawn before
    drawnShapes.forEach((shape) => {
      context.strokeStyle = shape.color;
      drawStoredShape(context, shape);
    });

    context.strokeStyle = color;
    if (shape === "rectangle") {
      context.strokeRect(startX, startY, offsetX - startX, offsetY - startY);
    } else if (shape === "circle") {
      const radius =
        Math.sqrt((offsetX - startX) ** 2 + (offsetY - startY) ** 2) / 2;
      context.beginPath();
      context.arc(
        startX + (offsetX - startX) / 2,
        startY + (offsetY - startY) / 2,
        radius,
        0,
        2 * Math.PI
      );
      context.stroke();
    } else if (shape === "triangle") {
      context.beginPath();
      context.moveTo(startX, startY);
      context.lineTo(startX + (offsetX - startX) / 2, offsetY);
      context.lineTo(offsetX, startY);
      context.closePath();
      context.stroke();
    }
  };

  const finishDrawing = ({ nativeEvent }) => {
    if (!isDrawing) return;

    const { offsetX, offsetY } = nativeEvent;
    setIsDrawing(false);

    const newShape = {
      type: shape,
      x: startX,
      y: startY,
      width: offsetX - startX,
      height: offsetY - startY,
      radius:
        shape === "circle"
          ? Math.sqrt((offsetX - startX) ** 2 + (offsetY - startY) ** 2) / 2
          : 0,
      color: color,
    };

    setDrawnShapes((prevShapes) => [...prevShapes, newShape]);
  };

  const drawStoredShape = (context, shape) => {
    context.strokeStyle = shape.color;
    if (shape.type === "rectangle") {
      context.strokeRect(shape.x, shape.y, shape.width, shape.height);
    } else if (shape.type === "circle") {
      context.beginPath();
      context.arc(
        shape.x + shape.width / 2,
        shape.y + shape.height / 2,
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
  };

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

  const handleColorChange = (e) => {
    setColor(e.target.value);
  };

  const handleShapeChange = (e) => {
    setShape(e.target.value);
  };

  const clearCanvas = () => {
    const context = contextRef.current;
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setDrawnShapes([]);
  };

  useEffect(() => {
    prepareCanvas();
  }, []);

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
        <div
          style={{
            paddingLeft: "6vh",
            paddingRight: "6vh",
            paddingBottom: "3vh",
          }}
        >
          <h3>Clear All : </h3>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button className="clear_btn" onClick={clearCanvas}>
              <svg
                fill="#FFFFFF"
                height="22px"
                width="55px"
                version="1.1"
                id="Icons"
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 32 32"
                xml:space="preserve"
              >
                <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  {" "}
                  <g>
                    {" "}
                    <path d="M28.7,8.9l-5.7-5.7c-1.1-1.1-3.1-1.1-4.2,0l-7.1,7.1c0,0,0,0,0,0s0,0,0,0l-7.5,7.5c-1.2,1.2-1.2,3.1,0,4.2l3.8,3.8 c0.2,0.2,0.4,0.3,0.7,0.3h6.6c0.3,0,0.5-0.1,0.7-0.3l12.7-12.7c0,0,0,0,0,0C29.9,12,29.9,10.1,28.7,8.9z M14.9,24.1H9.2l-3.5-3.5 c-0.4-0.4-0.4-1,0-1.4l6.8-6.8l7.1,7.1L14.9,24.1z"></path>{" "}
                    <path d="M27,28H5c-0.6,0-1,0.4-1,1s0.4,1,1,1h22c0.6,0,1-0.4,1-1S27.6,28,27,28z"></path>{" "}
                  </g>{" "}
                </g>
              </svg>
            </button>
          </div>
          <br />
        </div>
      </section>
      <section>
        <div>
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={drawShape}
            onMouseUp={finishDrawing}
          />
        </div>

        <div>
          <h3>Generated HTML Code:</h3>
          <pre>{generateHTMLCode()}</pre>
        </div>
      </section>
    </div>
  );
};

export default DrawingCanvas;
