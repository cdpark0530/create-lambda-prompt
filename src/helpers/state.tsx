import { type PropsWithChildren, useMemo } from "react";
import {
	type Control,
	type FieldPath,
	type FieldPathValue,
	FormProvider,
	type PathValue,
	type SetValueConfig,
	type UseFormStateProps,
	useForm,
	useFormContext,
	useFormState,
	useWatch,
} from "react-hook-form";

export const integrations = (["none", "oh-my-zsh"] as const).map((value) => ({
	key: value as string,
	label: value as string,
	value,
}));

export type Integration = Optionalize<(typeof integrations)[number], "key">;

export type AppState = {
	integration?: Integration;
};

export const AppProvider = ({ children }: PropsWithChildren) => {
	const form = useForm<AppState>({
		defaultValues: {},
	});

	return <FormProvider {...form}>{children}</FormProvider>;
};

export const useAppContext = <State extends AppState = AppState>() => {
	const { getValues, setValue, ...rest } = useFormContext<State>();

	const setValueWithPrev = useMemo(() => {
		return <Name extends FieldPath<State>>(
			name: Name,
			value:
				| PathValue<State, Name>
				| ((prev: PathValue<State, Name>) => PathValue<State, Name>),
			options?: SetValueConfig,
		) => {
			setValue(
				name,
				value instanceof Function ? value(getValues(name)) : value,
				options,
			);
		};
	}, [getValues, setValue]);

	return {
		getValues,
		setValue: setValueWithPrev,
		...rest,
	};
};

export const useAppWatch = <
	Name extends FieldPath<State>,
	State extends AppState = AppState,
>(props: {
	name: Name;
	defaultValue?: FieldPathValue<State, Name>;
	control?: Control<State>;
	disabled?: boolean;
	exact?: boolean;
}) => {
	return useWatch<State, Name>(props);
};

export const useAppState = (props: UseFormStateProps<AppState>) => {
	return useFormState<AppState>(props);
};
