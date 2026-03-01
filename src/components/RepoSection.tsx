import type { TransformedEvent } from "../lib/types.ts";
import { RepoIcon } from "./icons/RepoIcon.tsx";
import { PRListItem } from "./PRListItem.tsx";

interface RepoSectionProps {
  repo: string;
  events: TransformedEvent[];
}

export function RepoSection({ repo, events }: RepoSectionProps) {
  return (
    <>
      <div className="repo-header">
        <RepoIcon />
        <a
          href={`https://github.com/${repo}`}
          target="_blank"
          rel="noopener noreferrer"
          className="repo-link"
        >
          {repo}
        </a>
      </div>
      <ul className="github-activity-list pr-list">
        {events.map((e) => (
          <PRListItem key={e.id} event={e} />
        ))}
      </ul>
    </>
  );
}
