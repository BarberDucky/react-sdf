import "./number-input.css";

function NumberInput(props: {
	label: string;
	labelColor: string;
	value: number;
	onValueChange: (value: number) => void;
}) {
	return (
		<div className="number-input">
			<span style={{ color: props.labelColor }}>{props.label}</span>
			<input
				type="number"
				value={props.value}
				onChange={(e) => {
					props.onValueChange(Number.parseFloat(e.target.value));
				}}
			/>
		</div>
	);
}

export default NumberInput;