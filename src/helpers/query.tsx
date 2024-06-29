import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type PropsWithChildren, memo } from "react";

const queryClient = new QueryClient();

export const MyQueryClientProvider = memo(({ children }: PropsWithChildren) => (
	<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
));
