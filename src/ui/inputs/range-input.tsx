import "./range-input.css";

function RangeInput(props: {
  labelColor: string;
  value: number;
  range: { min: number; max: number };
  onValueChange: (value: number) => void;
}) {
  return (
    <div className="range-input">
      <input
        style={{ accentColor: props.labelColor }}
        type="range"
        min={props.range.min}
        max={props.range.max}
        value={props.value}
        onChange={(e) => {
          props.onValueChange(Number.parseFloat(e.target.value));
        }}
      />
      <div className="range-input-labels">
        <span className="range-input-left">{props.range.min}</span>
        <span className="range-input-value">{props.value}</span>
        <span className="range-input-right">{props.range.max}</span>
      </div>
    </div>
  );
}

export default RangeInput;