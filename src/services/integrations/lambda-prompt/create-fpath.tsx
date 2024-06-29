import { mkdir } from "node:fs/promises";
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

export const fpath = "/usr/local/share/zsh/site-functions";

export const useFpathCreator = (
	options?: Omit<
		UndefinedInitialDataOptions<null, Error>,
		"queryKey" | "queryFn" | "retry"
	>,
) => {
	const { error, isError, isFetching, isSuccess } = useQuery({
		queryKey: ["useFpathCreator"],
		queryFn: async () => {
			await mkdir(fpath, {
				recursive: true,
			});

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

export const FpathCreator = memo(() => {
	const { error, isError, isFetching, isSuccess } = useFpathCreator();

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
					Creating <SymbolText>fpath</SymbolText>(
					<FilenameText>{fpath}</FilenameText>)
				</Highlight>
			</Text>
			{isError && <FailedTextWithSudoSuggestion error={error} />}
		</>
	);
});
