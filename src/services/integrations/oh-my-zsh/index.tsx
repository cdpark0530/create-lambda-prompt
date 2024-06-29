import { Indent } from "@/components/boxes";
import { Highlight, NormalText, ProgressIndicator } from "@/components/texts";
import { Text } from "ink";
import {
	InstallationChecker,
	useOmzInstallationChecker,
} from "./check-installation";
import { ZshConfigurer } from "./configure-zsh";
import { ThemeCopier, useThemeCopier } from "./copy-theme";

export const appName = "oh-my-zsh";

export const OhMyZshIntegration = () => {
	const {
		isError: isOmzNotInstalled,
		isFetching: isCheckingOmzInstallation,
		isSuccess: isOmzInstalled,
	} = useOmzInstallationChecker({
		enabled: false,
	});

	const {
		isError: isThemeCopyFailed,
		isFetching: isCopyingTheme,
		isSuccess: isThemeCopySucceeded,
	} = useThemeCopier({
		enabled: false,
	});

	const isLoading = isCheckingOmzInstallation || isCopyingTheme;
	const isSuccess = isOmzInstalled || isThemeCopySucceeded;

	return (
		<>
			<Text>
				<ProgressIndicator
					isError={isOmzNotInstalled || isThemeCopyFailed}
					isLoading={isLoading}
					isSuccess={isSuccess}
				/>
				<Highlight on={isLoading}>
					Integrating with <NormalText>{appName}</NormalText>
				</Highlight>
			</Text>
			<Indent>
				<InstallationChecker />
				{isOmzInstalled && <ThemeCopier />}
				{isSuccess && <ZshConfigurer />}
			</Indent>
		</>
	);
};
