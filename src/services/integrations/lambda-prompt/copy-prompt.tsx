import { copyFile } from "node:fs/promises";
import { resolve } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { useExitOnError } from "@/components/process";
import {
	FailedTextWithSudoSuggestion,
	FilenameText,
	Highlight,
	ProgressIndicator,
	SymbolText,
} from "@/components/texts";
import {
	type UndefinedInitialDataOptions,
	useQuery,
} from "@tanstack/react-query";
import { Text } from "ink";
import { memo } from "react";
import { fpath } from "./create-fpath";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const promptId = "lambda-prompt";
export const promptFilename = `${promptId}.zsh`;
export const promptSrcPath = resolve(__dirname, promptFilename);
const promptDstPath = `${fpath}/prompt_${promptId}_setup`;

export const usePromptCopier = (
	options?: Omit<
		UndefinedInitialDataOptions<null, Error>,
		"queryKey" | "queryFn" | "retry"
	>,
) => {
	const { error, isError, isFetching, isSuccess } = useQuery({
		queryKey: ["usePromptCopier"],
		queryFn: async () => {
			await copyFile(promptSrcPath, promptDstPath);

			return null;
		},
		retry: () => false,
		...options,
	});

	return {
		error,
		isError,
		isFetching,
		isSuccess,
	};
};

export const PromptCopier = memo(() => {
	const { error, isError, isFetching, isSuccess } = usePromptCopier();

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
					Copying <FilenameText>{promptFilename}</FilenameText> to{" "}
					<SymbolText>fpath</SymbolText>
				</Highlight>
			</Text>
			{isError && <FailedTextWithSudoSuggestion error={error} />}
		</>
	);
});
