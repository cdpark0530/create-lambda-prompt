import { relative } from "node:path";
import packageJson from "@/package.json";
import { Newline, Text } from "ink";
import Spinner from "ink-spinner";
import {
	type ComponentProps,
	type PropsWithChildren,
	type ReactNode,
	memo,
} from "react";

export const convertToRelativePathFromHome = ({ to }: { to: string }) => {
	const pathFromHome = relative(process.env.HOME ?? "~", to);

	return `~/${pathFromHome}`;
};

export const NormalText = memo(({ children }: PropsWithChildren) => (
	<Text color="white">{children}</Text>
));

export const Highlight = memo(
	({
		children,
		on = true,
	}: PropsWithChildren<{
		on?: boolean;
	}>) => <Text color={on ? "white" : "gray"}>{children}</Text>,
);

export const BoldHighlight = memo(
	({
		children,
		on = true,
	}: PropsWithChildren<{
		on?: boolean;
	}>) => (
		<Text bold={on} color={on ? "white" : "gray"}>
			{children}
		</Text>
	),
);

export const SuggestionText = memo(({ children }: PropsWithChildren) => (
	<Text bold>{children}</Text>
));

export const TmiText = memo(({ children }: PropsWithChildren) => (
	<Text color="gray">{children}</Text>
));

export const NoticeText = memo(({ children }: PropsWithChildren) => (
	<Text bold color="yellow">
		{children}
	</Text>
));

export const SymbolText = memo(({ children }: PropsWithChildren) => (
	<Text color="magentaBright">{children}</Text>
));

export const FilenameText = memo(({ children }: PropsWithChildren) => (
	<Text color="green">{children}</Text>
));

export const LinkText = memo(({ children }: PropsWithChildren) => (
	<Text color="blueBright">{children}</Text>
));

export const CodeText = memo(({ children }: PropsWithChildren) => (
	<Text color="cyan">{children}</Text>
));

export const TerminationText = memo(() => (
	<Text>
		<Newline />
		<Newline />
		<Text bold color="whiteBright">
			Terminating the program...
		</Text>
		<Newline />
	</Text>
));

export const ErrorText = memo(({ error }: { error: Error | ReactNode }) => (
	<Text>
		<Newline />
		<Text color="red">
			Failed. Error details↓
			<Newline />
			{error instanceof Error ? error.message : error}
		</Text>
		<Newline />
	</Text>
));

export const FailedTextWithSudoSuggestion = memo(
	({ error }: ComponentProps<typeof ErrorText>) => (
		<Text>
			<ErrorText error={error} />
			<SuggestionText>
				This is mostly caused by permission. Try:{" "}
				<CodeText>sudo {packageJson.name}</CodeText>
			</SuggestionText>
			<TerminationText />
		</Text>
	),
);

export const FailedTextWith3rdPartyLink = memo(
	({
		appLookUpPath,
		appName,
		error,
		link,
	}: ComponentProps<typeof ErrorText> & {
		appLookUpPath: ReactNode;
		appName: ReactNode;
		link: ReactNode;
	}) => (
		<Text>
			<ErrorText error={error} />
			Couldn't find <SymbolText>{appName}</SymbolText> at{" "}
			<FilenameText>{appLookUpPath}</FilenameText>.
			<Newline />
			<SuggestionText>
				Try it again after installing it first: <LinkText>{link}</LinkText>
			</SuggestionText>
			<TerminationText />
		</Text>
	),
);

export const FailedTextWithManualConfigSuggestion = memo(
	({
		config,
		error,
		filename,
	}: ComponentProps<typeof ErrorText> & {
		config: ReactNode;
		filename: ReactNode;
	}) => (
		<Text>
			<ErrorText error={error} />
			<SuggestionText>
				Try to manually put the following config in{" "}
				<SymbolText>{filename}</SymbolText>:<Newline />
				<CodeText>{config}</CodeText>
			</SuggestionText>
			<TerminationText />
		</Text>
	),
);

export const ProgressIndicator = memo(
	({
		isError,
		isLoading,
		isSuccess,
	}: { isError: boolean; isLoading: boolean; isSuccess: boolean }) => (
		<Text color="green">
			{isError ? "❌" : isSuccess ? "✔︎" : isLoading ? <Spinner /> : null}{" "}
		</Text>
	),
);

export const SelectText = memo(
	({
		label,
		on,
		value,
	}: { label: ReactNode; on: boolean; value: ReactNode }) => (
		<Text>
			<Text color="green">{value ? "✔︎" : "?"} </Text>
			<BoldHighlight on={on}>{label}</BoldHighlight>
			<Text dimColor> › </Text>
			<Text>{value}</Text>
		</Text>
	),
);
