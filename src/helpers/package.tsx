import { CodeText, NormalText, NoticeText } from "@/components/texts";
import packageJson from "@/package.json";
import { useQuery } from "@tanstack/react-query";
import { memo, useEffect, useMemo, useState } from "react";
import checkForUpdate from "update-check";

type PackageManager = "npm" | "pnpm" | "yarn";

const getPackageManager = (): PackageManager => {
	const userAgent = process.env.npm_config_user_agent || "";

	if (userAgent.startsWith("yarn")) {
		return "yarn";
	}

	if (userAgent.startsWith("pnpm")) {
		return "pnpm";
	}

	return "npm";
};

const usePackageManager = () => {
	return useMemo(() => getPackageManager(), []);
};

const useUpdateMessage = () => {
	const packageManager = usePackageManager();

	return useMemo(
		() =>
			packageManager === "yarn"
				? `yarn global add ${packageJson.name}`
				: packageManager === "pnpm"
					? `pnpm add -g ${packageJson.name}`
					: `npm i -g ${packageJson.name}`,
		[packageManager],
	);
};

const useLatestVersion = () => {
	const { data, status } = useQuery({
		queryKey: ["checkForUpdate"],
		queryFn: () => checkForUpdate(packageJson),
	});

	return {
		data,
		status,
	};
};

const UpdateMessage = memo(() => {
	const updateMessage = useUpdateMessage();

	return (
		<>
			<NoticeText>
				A new version of '{packageJson.name}' is available!
			</NoticeText>
			<NormalText>
				You can update by running: <CodeText>{updateMessage}</CodeText>
			</NormalText>
		</>
	);
});

export const useUpdateNotification = () => {
	const [hasNotifiedUpdate, setHasNotifiedUpdate] = useState(false);
	const { data, status } = useLatestVersion();

	useEffect(() => {
		if (status !== "pending") {
			if (status === "error") {
				setHasNotifiedUpdate(true);

				return;
			}
			const timer = setTimeout(() => {
				setHasNotifiedUpdate(true);
			}, 3000);

			return () => clearTimeout(timer);
		}

		return;
	}, [status]);

	return {
		hasNotifiedUpdate,
		UpdateMessage: data && UpdateMessage,
	};
};
