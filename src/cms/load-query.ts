import type { ClientPerspective, QueryParams } from "@sanity/client";
import { sanityClient } from "sanity:client";

const token = import.meta.env.SANITY_API_READ_TOKEN;

const parsePerspective = (
	raw: string | undefined,
): ClientPerspective | undefined => {
	if (!raw) return undefined;
	const decoded = decodeURIComponent(raw);
	if (decoded.startsWith("[")) {
		try {
			return JSON.parse(decoded) as ClientPerspective;
		} catch {
			return undefined;
		}
	}
	return decoded as ClientPerspective;
};

interface ILoadQueryOptions<TParams extends QueryParams = QueryParams> {
	query: string;
	params?: TParams;
	perspectiveCookie?: string | undefined;
}

export const loadQuery = async <TResult>({
	query,
	params,
	perspectiveCookie,
}: ILoadQueryOptions) => {
	const draftMode = Boolean(perspectiveCookie);

	if (draftMode && !token) {
		throw new Error(
			"SANITY_API_READ_TOKEN is required during visual editing.",
		);
	}

	const perspective: ClientPerspective = draftMode
		? (parsePerspective(perspectiveCookie) ?? "drafts")
		: "published";

	const { result, resultSourceMap } = await sanityClient.fetch<TResult>(
		query,
		params ?? {},
		{
			filterResponse: false,
			perspective,
			resultSourceMap: false,
			stega: false,
			...(draftMode ? { token } : {}),
		},
	);

	return {
		data: result,
		sourceMap: resultSourceMap,
		perspective,
	};
};
