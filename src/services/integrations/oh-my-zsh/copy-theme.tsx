import { copyFile } from "node:fs/promises";
import { resolve } from "node:path";
import { useExitOnError } from "@/components/process";
import {
	FailedTextWithSudoSuggestion,
	FilenameText,
	Highlight,
	ProgressIndicator,
	convertToRelativePathFromHome,
} from "@/components/texts";
import {
	type UndefinedInitialDataOptions,
	useQuery,
} from "@tanstack/react-query";
import { Text } from "ink";
import { memo } from "react";
import { promptFilename, promptSrcPath } from "../lambda-prompt/copy-prompt";
import { omzHomePath } from "./check-installation";

const themeDstName = `${promptFilename}-theme`;

const themeDstPath = resolve(omzHomePath, "custom/themes", themeDstName);
const themeDstPathToDisplay = convertToRelativePathFromHome({
	to: themeDstPath,
});

export const useThemeCopier = (
	options?: Omit<
		UndefinedInitialDataOptions<null, Error>,
		"queryKey" | "queryFn" | "retry"
	>,
) => {
	const { error, isError, isFetching, isSuccess } = useQuery({
		queryKey: ["useOhMyZshThemeCopier"],
		queryFn: async () => {
			await copyFile(promptSrcPath, themeDstPath);

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

export const ThemeCopier = memo(() => {
	const { error, isError, isFetching, isSuccess } = useThemeCopier();

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
					<FilenameText>{themeDstPathToDisplay}</FilenameText>
				</Highlight>
			</Text>
			{isError && <FailedTextWithSudoSuggestion error={error} />}
		</>
	);
});
