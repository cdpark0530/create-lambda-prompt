import { Box } from "ink";
import { type PropsWithChildren, memo } from "react";

export const Indent = memo(({ children }: PropsWithChildren) => (
	<Box flexDirection="column" paddingLeft={1}>
		{children}
	</Box>
));
