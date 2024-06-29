import { Newline } from "ink";
import { useMemo } from "react";
import { useExit } from "./components/process";
import { useUpdateNotification } from "./helpers/package";
import { useAppWatch } from "./helpers/state";
import { SelectIntegration } from "./services/integrations";
import { ZshIntegration } from "./services/integrations/lambda-prompt";
import { useZshConfigurationForPrompt } from "./services/integrations/lambda-prompt/setup-zsh/configure-zsh";
import { OhMyZshIntegration } from "./services/integrations/oh-my-zsh";
import { useZshConfigurationForOmz } from "./services/integrations/oh-my-zsh/configure-zsh";

export const App = () => {
	const { hasNotifiedUpdate, UpdateMessage } = useUpdateNotification();

	const { isSuccess: isZshIntegrationSucceeded } = useZshConfigurationForPrompt(
		{
			enabled: false,
		},
	);

	const integration = useAppWatch({
		name: "integration",
	});

	const Integrator = useMemo(() => {
		switch (integration?.value) {
			case "oh-my-zsh":
				return OhMyZshIntegration;

			default:
				return null;
		}
	}, [integration]);

	const { error: omzIntegrationError, status: omzIntegrationStatus } =
		useZshConfigurationForOmz({
			enabled: false,
		});

	const error = omzIntegrationError;
	const isDone = omzIntegrationStatus !== "pending" && integration?.value;

	useExit({
		error,
		isDone,
	});

	return (
		<>
			{UpdateMessage && <UpdateMessage />}
			{hasNotifiedUpdate && (
				<>
					<Newline />
					<ZshIntegration />
					{isZshIntegrationSucceeded && (
						<>
							<Newline />
							<SelectIntegration />
							{Integrator && (
								<>
									<Newline />
									<Integrator />
								</>
							)}
						</>
					)}
				</>
			)}
			{isDone && <Newline />}
		</>
	);
};
