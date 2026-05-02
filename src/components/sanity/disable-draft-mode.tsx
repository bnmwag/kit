import { useIsPresentationTool } from "@sanity/visual-editing/react";
import type { FC } from "react";

export const DisableDraftMode: FC = () => {
	const isPresentationTool = useIsPresentationTool();

	if (isPresentationTool !== false) return null;

	return (
		<div className='theme-light fixed bottom-grid-margin left-grid-margin border border-foreground/15 p-grid-gutter space-y-1.5'>
			<p className="font-bold text-sm text-accent">
				CAUTION
			</p>
			<p className="font-normal text-sm">
				You're viewing unpublished drafts. <br />
				Public visitors see the live, published version — not what's rendered here.
			</p>
			<a href='/api/draft-mode/disable' className="font-normal text-sm underline">Disable draft mode</a>
		</div>
	);
};

export default DisableDraftMode;
