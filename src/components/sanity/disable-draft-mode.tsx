import { useIsPresentationTool } from "@sanity/visual-editing/react";
import type { FC } from "react";

export const DisableDraftMode: FC = () => {
	const isPresentationTool = useIsPresentationTool();

	if (isPresentationTool !== false) return null;

	return (
		<a
			href='/api/draft-mode/disable'
			style={{
				position: "fixed",
				bottom: "1rem",
				right: "1rem",
				zIndex: 50,
				padding: "0.5rem 1rem",
				borderRadius: "9999px",
				backgroundColor: "#101112",
				color: "#fff",
				fontSize: "0.875rem",
				textDecoration: "none",
				fontFamily: "var(--font-mono, monospace)",
			}}
		>
			Disable Draft Mode
		</a>
	);
};

export default DisableDraftMode;
