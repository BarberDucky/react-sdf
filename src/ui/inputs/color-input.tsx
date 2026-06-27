import { useRef } from "react";
import "./color-input.css";

function ColorInput(props: {
	value: string;
	onValueChange: (value: string) => void;
}) {
	const inputRef = useRef<HTMLInputElement>(null);

	function togglePicker() {
		if (inputRef.current?.showPicker) {
			inputRef.current?.click();
		} else {
			inputRef.current?.showPicker();
		}
	}

	return (
		<div
			className="color-input"
			style={{ backgroundColor: props.value }}
			onClick={() => togglePicker()}
		>
			<input
				ref={inputRef}
				type="color"
				value={props.value}
				onChange={(e) => {
					props.onValueChange(e.target.value);
					console.log("change", e.target.value);
				}}
			/>
		</div>
	);
}

export default ColorInput;