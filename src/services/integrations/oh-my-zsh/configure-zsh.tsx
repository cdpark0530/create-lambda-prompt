import { EOL } from "node:os";
import { useZshConfiguration, zshrcPath } from "@/components/file";
import { useExitOnError } from "@/components/process";
import {
	FailedTextWithManualConfigSuggestion,
	FilenameText,
	Highlight,
	NormalText,
	ProgressIndicator,
	TmiText,
	convertToRelativePathFromHome,
} from "@/components/texts";
import { Text } from "ink";
import { memo } from "react";

const zshrc = convertToRelativePathFromHome({ to: zshrcPath });

const config = `export ZSH="$HOME/.oh-my-zsh"
ZSH_THEME="lambda-prompt"
source $ZSH/oh-my-zsh.sh`;

const configs = config.split(EOL);

const overridingInsertLines = [configs[1]];

export const useZshConfigurationForOmz = useZshConfiguration.bind(null, {
	insertLines: configs,
	insertPosition: "fileStart",
	strategies: [
		{
			lineMatcher: /^ZSH_THEME=("|')[^"']*("|')/,
			insertLines: overridingInsertLines,
		},
		{
			endLineMatcher: /^source [^/]*\/oh-my-zsh\.sh/,
			insertLines: overridingInsertLines,
		},
	],
});

export const ZshConfigurer = memo(() => {
	const { data, error, isError, isFetching, isSuccess } =
		useZshConfigurationForOmz();

	useExitOnError({ error });

	return (
		<>
			<Text>
				<ProgressIndicator
					isError={isError}
					isLoading={isFetching}
					isSuccess={isSuccess}
				/>
				<Highlight on={isFetching}>
					Configuring <FilenameText>{zshrc}</FilenameText> for{" "}
					<NormalText>oh-my-zsh</NormalText>
					{!isFetching && data && <TmiText> ({data})</TmiText>}
				</Highlight>
			</Text>
			{isError && (
				<FailedTextWithManualConfigSuggestion
					config={config}
					filename={zshrc}
					error={error}
				/>
			)}
		</>
	);
});
