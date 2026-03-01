import type { TransformedEvent } from "../lib/types.ts";
import { formatMonthDay } from "../lib/date.ts";
import { safeRepoName } from "../lib/events.ts";

interface OtherEventItemProps {
  event: TransformedEvent;
}

export function OtherEventItem({ event }: OtherEventItemProps) {
  return (
    <li className="other-event">
      <b>{(event.type || "").replace("Event", "")}</b>
      {" on "}
      <code>{safeRepoName(event)}</code>
      <br />
      <small className="github-date">
        {event.created_at ? formatMonthDay(event.created_at) : ""}
      </small>
    </li>
  );
}
