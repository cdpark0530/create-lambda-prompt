import { constants, access } from "node:fs/promises";
import { resolve } from "node:path";
import type { MaybeFileError } from "@/components/file";
import { useExitOnError } from "@/components/process";
import {
	FailedTextWith3rdPartyLink,
	FailedTextWithSudoSuggestion,
	Highlight,
	NormalText,
	ProgressIndicator,
} from "@/components/texts";
import {
	type UndefinedInitialDataOptions,
	useQuery,
} from "@tanstack/react-query";
import { Text } from "ink";
import { memo } from "react";
import { appName } from ".";

export const omzHomePath = resolve(process.env.HOME ?? "~", ".oh-my-zsh");

export const useOmzInstallationChecker = (
	options?: Omit<
		UndefinedInitialDataOptions<null, MaybeFileError>,
		"queryKey" | "queryFn" | "retry"
	>,
) => {
	const { error, isError, isFetching, isSuccess } = useQuery({
		queryKey: ["useOmzInstallationChecker"],
		queryFn: async () => {
			await access(omzHomePath, constants.X_OK);

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

export const InstallationChecker = memo(() => {
	const { error, isError, isFetching, isSuccess } = useOmzInstallationChecker();

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
					Checking installation of <NormalText>{appName}</NormalText>
				</Highlight>
			</Text>
			{error &&
				(error.code === "ENOENT" ? (
					<FailedTextWith3rdPartyLink
						appLookUpPath={omzHomePath}
						appName={appName}
						error={error}
						link="https://ohmyz.sh/"
					/>
				) : (
					<FailedTextWithSudoSuggestion error={error} />
				))}
		</>
	);
});
