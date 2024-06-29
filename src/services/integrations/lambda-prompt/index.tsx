import { Indent } from "@/components/boxes";
import { Highlight, NormalText, ProgressIndicator } from "@/components/texts";
import { Text } from "ink";
import { memo } from "react";
import { AsyncCopier, useAsyncCopier } from "./copy-async";
import { PromptCopier, usePromptCopier } from "./copy-prompt";
import { FpathCreator, useFpathCreator } from "./create-fpath";
import { ZshInitializer } from "./setup-zsh";

export const ZshIntegration = memo(() => {
	const {
		isError: isFpathCreationFailed,
		isFetching: isCreatingFpath,
		isSuccess: isFpathCreationSucceeded,
	} = useFpathCreator({
		enabled: false,
	});
	const {
		isError: isPromptCopyFailed,
		isFetching: isCopyingPrompt,
		isSuccess: isPromptCopySucceeded,
	} = usePromptCopier({
		enabled: false,
	});
	const {
		isError: isAsyncCopyFailed,
		isFetching: isCopyingAsync,
		isSuccess: isAsyncCopySucceeded,
	} = useAsyncCopier({
		enabled: false,
	});

	const isLoading = isCreatingFpath || isCopyingPrompt || isCopyingAsync;
	const isSuccess =
		isFpathCreationSucceeded || isPromptCopySucceeded || isAsyncCopySucceeded;

	return (
		<>
			<Text>
				<ProgressIndicator
					isError={
						isFpathCreationFailed || isPromptCopyFailed || isAsyncCopyFailed
					}
					isLoading={isLoading}
					isSuccess={isSuccess}
				/>
				<Highlight on={isLoading}>
					Integrating with <NormalText>zsh</NormalText>
				</Highlight>
			</Text>
			<Indent>
				<FpathCreator />
				{isFpathCreationSucceeded && <PromptCopier />}
				{isFpathCreationSucceeded && <AsyncCopier />}
				{isSuccess && <ZshInitializer />}
			</Indent>
		</>
	);
});
