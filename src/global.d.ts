export type {};

type ExtractOptionalKeys<T> = Exclude<
	{
		[K in keyof T]: T extends Record<K, T[K]> ? never : K;
	}[keyof T],
	undefined
>;

declare global {
	type Last<T extends any[]> = T extends [...infer _, infer LastElement]
		? LastElement
		: T extends [...infer _, (infer LastElement)?]
			? LastElement | undefined
			: never;

	type LastParameter<F extends (...args: any) => any> = Last<Parameters<F>>;

	export type Collect<
		T,
		K extends keyof T,
		OptionalKeys extends Extract<ExtractOptionalKeys<T>, K> = Extract<
			ExtractOptionalKeys<T>,
			K
		>,
		RequiredKeys extends Exclude<K, OptionalKeys> = Exclude<K, OptionalKeys>,
	> = {
		[P in RequiredKeys]: T[P];
	} & {
		[P in OptionalKeys]?: T[P];
	};

	export type Optionalize<
		T,
		K extends keyof T,
		OptionalKeys extends ExtractOptionalKeys<T> | K =
			| ExtractOptionalKeys<T>
			| K,
		RequiredKeys extends Exclude<keyof T, OptionalKeys> = Exclude<
			keyof T,
			OptionalKeys
		>,
	> = {
		[P in RequiredKeys]: T[P];
	} & {
		[P in OptionalKeys]?: T[P];
	};
}
