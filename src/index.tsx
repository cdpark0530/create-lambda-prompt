#!/usr/bin/env node

import { render } from "ink";
import { App } from "./app";
import { MyQueryClientProvider } from "./helpers/query";
import { AppProvider } from "./helpers/state";

const handleSigTerm = () => process.exit(0);

process.on("SIGINT", handleSigTerm);
process.on("SIGTERM", handleSigTerm);

render(
	<MyQueryClientProvider>
		<AppProvider>
			<App />
		</AppProvider>
	</MyQueryClientProvider>,
);
