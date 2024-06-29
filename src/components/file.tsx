import assert from "node:assert";
import { chown, copyFile, readFile, writeFile } from "node:fs/promises";
import { EOL } from "node:os";
import { resolve } from "node:path";
import {
	type UndefinedInitialDataOptions,
	useQuery,
} from "@tanstack/react-query";
import dayjs from "dayjs";
import { useMemo } from "react";

const getAnonFilePostfix = () => dayjs().format("YYYYMMDDT_HHmmss");

type FileErrorOnlyObject = {
	code: string;
	errno: number;
};

export type MaybeFileError = Error &
	(Partial<FileErrorOnlyObject> | FileErrorOnlyObject);

const isFileError = (err: unknown): err is Error & FileErrorOnlyObject =>
	err instanceof Error &&
	"code" in err &&
	typeof err.code === "string" &&
	"errno" in err &&
	typeof err.errno === "number";

export const useFileCopier = (
	src: string,
	dest: string,
	options?: Omit<
		UndefinedInitialDataOptions<string, MaybeFileError>,
		"queryKey" | "queryFn" | "retry"
	>,
) => {
	const { data, error, isError, isFetching, isSuccess } = useQuery({
		queryKey: ["useFileCopier", src, dest],
		queryFn: async () => {
			try {
				await copyFile(src, dest);
			} catch (err) {
				if (isFileError(err)) {
					switch (err.code) {
						case "ENOENT":
							return "source not found and no copy made";
					}
				}

				throw err;
			}

			return "copied";
		},
		...options,
	});

	return {
		data,
		error,
		isError,
		isFetching,
		isSuccess,
	};
};

type UseFileCopierOptions = LastParameter<typeof useFileCopier>;

export const useBackUpMaker = (src: string, options?: UseFileCopierOptions) => {
	const dest = useMemo(() => `${src}.backup_${getAnonFilePostfix()}`, [src]);

	const copyResult = useFileCopier(src, dest, options);

	return {
		...copyResult,
		src,
		dest,
	};
};

export const zshrcPath = resolve(process.env.HOME ?? "~", ".zshrc");

export const useZshBackUpMaker = useBackUpMaker.bind(null, zshrcPath);

export const useZshConfiguration = (
	{
		strategies,
		insertLines,
		insertPosition,
	}: {
		strategies: ((
			| {
					lineMatcher: string | RegExp;
					startLineMatcher?: never;
					endLineMatcher?: never;
					replaceStrategy?: never;
			  }
			| {
					lineMatcher?: never;
					startLineMatcher: string | RegExp;
					endLineMatcher?: never;
					replaceStrategy?: never;
			  }
			| {
					lineMatcher?: never;
					startLineMatcher?: never;
					endLineMatcher: string | RegExp;
					replaceStrategy?: never;
			  }
			| {
					lineMatcher?: never;
					startLineMatcher: string | RegExp;
					endLineMatcher: string | RegExp;
					replaceStrategy: "always" | "replaceIfNoCodeBetweenStartAndEndLine";
			  }
		) & {
			insertLines?: string[] | readonly string[];
		})[];
		insertLines: string[] | readonly string[];
		insertPosition: "fileStart" | "fileEnd";
	},
	queryOptions?: Omit<
		UndefinedInitialDataOptions<string, Error>,
		"queryFn" | "queryKey" | "retry"
	>,
) => {
	const { data, error, isError, isFetching, isSuccess, status } = useQuery({
		queryKey: ["useZshConfiguration", insertLines],
		queryFn: async () => {
			if (
				strategies.every(
					({
						lineMatcher,
						startLineMatcher,
						endLineMatcher,
						replaceStrategy,
						insertLines,
					}) =>
						(typeof lineMatcher === "string"
							? !lineMatcher
							: replaceStrategy
								? !startLineMatcher || !endLineMatcher
								: !startLineMatcher && !endLineMatcher) &&
						(!insertLines || insertLines.length),
				)
			) {
				throw new Error(
					"`strategies` is empty, or some matchers or `insertLines` of it are empty.",
				);
			}

			let fileLines = [...insertLines, ""];
			let result = "created";

			try {
				fileLines = (await readFile(zshrcPath)).toString().split(EOL);

				let replaceStartIdx: number | null = null;
				let replaceEndIdx: number | null = null;

				const strategy = strategies.find(
					({
						lineMatcher,
						startLineMatcher,
						endLineMatcher,
						replaceStrategy,
					}) => {
						replaceStartIdx = replaceEndIdx = null;

						const abortOnCodeBetweenStartAndEnd =
							replaceStrategy === "replaceIfNoCodeBetweenStartAndEndLine";

						const predicate =
							/**
							 * NOTE
							 * Checking truty of `lineMatcher` is not enough
							 * to narrow whether the case is where `lineMatcher` is either `string` or `RegExp`
							 * within typescript@5.3.3
							 */
							lineMatcher !== undefined
								? (lineIdx: number) => {
										const line = fileLines[lineIdx];

										if (
											typeof lineMatcher === "string"
												? lineMatcher === line
												: line.match(lineMatcher)
										) {
											replaceStartIdx = lineIdx;
											replaceEndIdx = lineIdx + 1;
											return true;
										}

										return false;
									}
								: replaceStrategy
									? (lineIdx: number) => {
											const line = fileLines[lineIdx].trim();

											if (replaceEndIdx === null) {
												if (
													typeof endLineMatcher === "string"
														? endLineMatcher === line
														: line.match(endLineMatcher)
												) {
													replaceEndIdx = lineIdx + 1;
												}
											} else if (
												typeof startLineMatcher === "string"
													? startLineMatcher === line
													: line.match(startLineMatcher)
											) {
												replaceStartIdx = lineIdx;
												return true;
											} else if (
												abortOnCodeBetweenStartAndEnd &&
												line &&
												!line.startsWith("#")
											) {
												throw new Error("Non blank line detected.", {
													cause: "abort",
												});
											}

											return false;
										}
									: (lineIdx: number) => {
											const line = fileLines[lineIdx].trim();

											const startOrEndLinematcher =
												startLineMatcher ?? endLineMatcher;
											if (
												typeof startOrEndLinematcher === "string"
													? startOrEndLinematcher === line
													: line.match(startOrEndLinematcher)
											) {
												replaceStartIdx = replaceEndIdx =
													lineIdx + (startLineMatcher ? 1 : 0);
												return true;
											}

											return false;
										};

						try {
							for (
								let lineIdx = fileLines.length - 1;
								lineIdx >= 0;
								lineIdx--
							) {
								if (predicate(lineIdx)) {
									return true;
								}
							}
						} catch (err) {
							if (!(err instanceof Error) || err.cause !== "abort") {
								throw err;
							}
						}

						return false;
					},
				);

				if (replaceStartIdx !== null && replaceEndIdx !== null) {
					result = "modified";

					assert(strategy);

					const overridenInsertLines = strategy.insertLines ?? insertLines;

					const paddedInsertLines =
						strategy.lineMatcher || strategy.replaceStrategy
							? overridenInsertLines
							: strategy.startLineMatcher
								? ["", ...overridenInsertLines]
								: [...overridenInsertLines, ""];

					fileLines.splice(
						replaceStartIdx,
						replaceEndIdx - replaceStartIdx,
						...paddedInsertLines,
					);
				} else {
					result = "added";

					const insertStart = insertPosition === "fileStart";

					const paddedInsertLines = insertStart
						? fileLines.at(0)?.trim() === ""
							? insertLines
							: [...insertLines, ""]
						: fileLines.at(-1)?.trim() === ""
							? [...insertLines, ""]
							: ["", ...insertLines, ""];

					fileLines.splice(
						insertStart ? 0 : fileLines.length,
						0,
						...paddedInsertLines,
					);
				}
			} catch (err) {
				if (isFileError(err)) {
					switch (err.code) {
						case "ENOENT":
							break;

						default:
							throw err;
					}
				} else {
					throw err;
				}
			}

			await writeFile(zshrcPath, fileLines.join(EOL), {
				flag: "w",
			});
			await chown(
				zshrcPath,
				Number(process.env.SUDO_UID),
				Number(process.env.SUDO_GID),
			);

			return result;
		},
		...queryOptions,
	});

	return {
		data,
		error,
		isError,
		isFetching,
		isSuccess,
		status,
	};
};
