import type { TransformedEvent } from "../lib/types.ts";
import { formatMonthDay } from "../lib/date.ts";
import { PRStatusIcon } from "./icons/PRStatusIcon.tsx";

interface PRListItemProps {
  event: TransformedEvent;
}

export function PRListItem({ event }: PRListItemProps) {
  return (
    <li className="pr-event">
      <PRStatusIcon action={event.action} merged={event.merged} />
      <a
        href={event.url}
        target="_blank"
        rel="noopener noreferrer"
        className="pr-title-link"
      >
        {event.title || "(no title)"}
      </a>
      <small className="github-date">
        {event.created_at ? formatMonthDay(event.created_at) : ""}
      </small>
    </li>
  );
}
