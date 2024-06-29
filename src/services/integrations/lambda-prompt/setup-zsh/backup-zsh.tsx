import { useBackUpMaker, zshrcPath } from "@/components/file";
import { useExitOnError } from "@/components/process";
import {
	FailedTextWithManualConfigSuggestion,
	FilenameText,
	Highlight,
	ProgressIndicator,
	TmiText,
	convertToRelativePathFromHome,
} from "@/components/texts";
import { Text } from "ink";
import { memo, useMemo } from "react";
import { config } from "./configure-zsh";

export const useZshBackUpMaker = useBackUpMaker.bind(null, zshrcPath);

export const ZshBackUpManager = memo(() => {
	const { src, dest, data, error, isError, isFetching, isSuccess } =
		useZshBackUpMaker();

	useExitOnError({ error });

	const { zshrcPath, zshrcBackupPath } = useMemo(
		() => ({
			zshrcPath: convertToRelativePathFromHome({ to: src }),
			zshrcBackupPath: convertToRelativePathFromHome({ to: dest }),
		}),
		[src, dest],
	);

	return (
		<>
			<Text>
				<ProgressIndicator
					isError={isError}
					isLoading={isFetching}
					isSuccess={isSuccess}
				/>
				<Highlight on={isFetching}>
					Backing up <FilenameText>{zshrcPath}</FilenameText> to{" "}
					<FilenameText>{zshrcBackupPath}</FilenameText>
					{!isFetching && data && <TmiText> ({data})</TmiText>}
				</Highlight>
			</Text>
			{isError && (
				<FailedTextWithManualConfigSuggestion
					config={config}
					filename={zshrcPath}
					error={error}
				/>
			)}
		</>
	);
});
