export default function HeavyPanel() {
  return (
    <div className="panel">
      <p>
        This component lives in its own chunk. The browser downloads it only after you press the button, so it does not add to the first page load.
      </p>
    </div>
  );
}
