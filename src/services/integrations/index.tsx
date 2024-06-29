import { SelectText } from "@/components/texts";
import {
	type Integration,
	integrations,
	useAppContext,
	useAppWatch,
} from "@/helpers/state";
import SelectInput from "ink-select-input";
import { memo, useCallback } from "react";

export const SelectIntegration = memo(() => {
	const { setValue } = useAppContext();

	const integration = useAppWatch({
		name: "integration",
	});

	const onSelect = useCallback(
		(item: Integration) => {
			setValue("integration", item);
		},
		[setValue],
	);

	return (
		<>
			<SelectText
				value={integration?.label}
				on={!integration}
				label="Pick an integration"
			/>
			{!integration && <SelectInput items={integrations} onSelect={onSelect} />}
		</>
	);
});
