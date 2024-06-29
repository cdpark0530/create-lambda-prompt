import { useEffect, useState } from "react";

export const useRenderingEffect = () => {
	type RenderingCallback = () => void;
	const [onRender, setOnRender] = useState<RenderingCallback>();

	useEffect(() => {
		if (!onRender) {
			return;
		}

		onRender();
	}, [onRender]);

	return setOnRender;
};
