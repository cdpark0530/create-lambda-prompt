import { useEffect } from "react";
import { useRenderingEffect } from "./rendering";

type UseExitOnErrorOptions = {
	error: Error | boolean | null;
};

export const useExitOnError = ({ error }: UseExitOnErrorOptions) => {
	const onRender = useRenderingEffect();

	useEffect(() => {
		if (error) {
			onRender(() => () => process.exit(1));
		}
	}, [error]);
};

type UseExitOptions = UseExitOnErrorOptions & {
	isDone: any;
};

export const useExit = ({ error, isDone }: UseExitOptions) => {
	const onRender = useRenderingEffect();

	useEffect(() => {
		if (isDone) {
			onRender(() => () => process.exit(error ? 1 : 0));
		}
	}, [isDone]);
};
