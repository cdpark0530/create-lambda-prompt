import { EOL } from "node:os";
import { basename } from "node:path";
import { useZshConfiguration, zshrcPath } from "@/components/file";
import { useExitOnError } from "@/components/process";
import {
	FailedTextWithManualConfigSuggestion,
	FilenameText,
	Highlight,
	NormalText,
	ProgressIndicator,
	TmiText,
} from "@/components/texts";
import { Text } from "ink";
import { memo } from "react";

const zshrc = basename(zshrcPath);

export const config = `autoload -U promptinit
promptinit
prompt lambda-prompt`;

const configs = config.split(EOL);

export const useZshConfigurationForPrompt = useZshConfiguration.bind(null, {
	insertLines: configs,
	insertPosition: "fileEnd",
	strategies: [
		{
			startLineMatcher: configs[0],
			endLineMatcher: configs[2],
			replaceStrategy: "always",
		},
	],
});

export const ZshConfigurer = memo(() => {
	const { data, error, isError, isFetching, isSuccess } =
		useZshConfigurationForPrompt();

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
					<NormalText>lambda-prompt</NormalText>
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
