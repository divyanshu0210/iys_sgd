import { useEffect, useRef, useState } from "react";

const SIZE = 30; // button size

export default function DraggableWhatsApp() {
  const ref = useRef(null);
  const [pos, setPos] = useState({
    x: window.innerWidth - SIZE - 16,
    y: window.innerHeight - SIZE - 120,
  });

  const isDragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const clamp = (value, min, max) =>
    Math.min(Math.max(value, min), max);

  useEffect(() => {
    const onMove = (e) => {
      if (!isDragging.current) return;

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const maxX = window.innerWidth - SIZE;
      const maxY = window.innerHeight - SIZE;

      const newX = clamp(clientX - offset.current.x, 0, maxX);
      const newY = clamp(clientY - offset.current.y, 0, maxY);

      setPos({ x: newX, y: newY });
    };

    const onUp = () => {
      isDragging.current = false;
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("touchend", onUp);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, []);

  const startDrag = (e) => {
    const rect = ref.current.getBoundingClientRect();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    offset.current = {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };

    isDragging.current = true;
  };

  return (
    <a
      ref={ref}
      href="https://wa.me/919075080391"
      target="_blank"
      rel="noopener noreferrer"
      onMouseDown={startDrag}
      onTouchStart={startDrag}
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        width: SIZE,
        height: SIZE,
        borderRadius: "50%",
        background: "#25D366",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
        cursor: "grab",
        zIndex: 9999,
        touchAction: "none",
      }}
    >
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
        alt="WhatsApp"
        style={{ width: 50, height: 50 }}
      />
    </a>
  );
}


// .whatsapp-float {
//   position: fixed;
//   bottom: 20px;
//   right: 20px;
//   background: #25d366;
//   width: 30px;
//   height: 30px;
//   border-radius: 50%;
//   box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   z-index: 999;
//   transition: transform 0.2s ease;
// }

// .whatsapp-float:hover {
//   transform: scale(1.08);
// }

// .whatsapp-float img {
//   width: 50px;
//   height: 50px;
// }
