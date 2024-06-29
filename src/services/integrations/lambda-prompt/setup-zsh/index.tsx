import { memo } from "react";
import { ZshBackUpManager, useZshBackUpMaker } from "./backup-zsh";
import { ZshConfigurer } from "./configure-zsh";

export const ZshInitializer = memo(() => {
	const { isSuccess: isBackUpMade } = useZshBackUpMaker({
		enabled: false,
	});

	return (
		<>
			<ZshBackUpManager />
			{isBackUpMade && <ZshConfigurer />}
		</>
	);
});
