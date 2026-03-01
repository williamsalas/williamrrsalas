import { useGitHubEvents } from "../hooks/useGitHubEvents.ts";
import { RepoSection } from "./RepoSection.tsx";
import { OtherEventItem } from "./OtherEventItem.tsx";

export function GitHubActivity() {
  const { prGroups, otherEvents, loading, error } = useGitHubEvents();

  if (error) {
    return <p className="github-events">{error}</p>;
  }

  if (loading) {
    return <p className="github-events">Loading recent GitHub activity...</p>;
  }

  if (prGroups.size === 0 && otherEvents.length === 0) {
    return <p className="github-events">No recent GitHub activity.</p>;
  }

  return (
    <div className="github-events">
      {[...prGroups.entries()].map(([repo, events]) => (
        <RepoSection key={repo} repo={repo} events={events} />
      ))}
      {otherEvents.length > 0 && (
        <ul className="github-activity-list other-list">
          {otherEvents.map((e) => (
            <OtherEventItem key={e.id} event={e} />
          ))}
        </ul>
      )}
    </div>
  );
}
