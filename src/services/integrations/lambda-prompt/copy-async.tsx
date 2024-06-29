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

const asyncDstName = "async";
const asyncFilename = `${asyncDstName}.zsh`;
const asyncSrcPath = resolve(__dirname, asyncFilename);
const asyncDstPath = `${fpath}/${asyncDstName}`;

export const useAsyncCopier = (
	options?: Omit<
		UndefinedInitialDataOptions<null, Error>,
		"queryKey" | "queryFn" | "retry"
	>,
) => {
	const { error, isError, isFetching, isSuccess } = useQuery({
		queryKey: ["useAsyncCopier"],
		queryFn: async () => {
			await copyFile(asyncSrcPath, asyncDstPath);

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

export const AsyncCopier = memo(() => {
	const { error, isError, isFetching, isSuccess } = useAsyncCopier();

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
					Copying <FilenameText>{asyncFilename}</FilenameText> to{" "}
					<SymbolText>fpath</SymbolText>
				</Highlight>
			</Text>
			{isError && <FailedTextWithSudoSuggestion error={error} />}
		</>
	);
});
