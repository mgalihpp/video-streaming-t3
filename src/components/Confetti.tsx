import Realistic from "react-canvas-confetti/dist/presets/realistic";

function Confetti() {
  return (
    <Realistic
      autorun={{
        speed: 1,
        delay: 1,
        duration: 500,
      }}
    />
  );
}

export default Confetti;
