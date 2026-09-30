// components/DecorativeText.jsx

export default function DecorativeText({
  text,
  top,
  left,
  right,
  bottom,
  rotate = -8,
  color = "#3B82F6",
  size = 18,
  className = "",
}) {
  return (
    <div
      className={`pointer-events-none absolute z-10 whitespace-pre-line font-medium italic leading-tight ${className}`}
      style={{
        top,
        left,
        right,
        bottom,
        transform: `rotate(${rotate}deg)`,
        color,
        fontSize: size,
        fontFamily: "'Caveat', cursive",
      }}
    >
      {text}
    </div>
  );
}