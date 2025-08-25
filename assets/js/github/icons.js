export function iconFor(event) {
  const img = document.createElement("img");
  img.width = 16;
  img.height = 16;
  img.className = "status-icon";

  if (event.action === "opened" || event.merged === false) {
    img.src = "assets/img/git-pull-request-16.svg";
    img.alt = "PR open";
  } else if (event.merged) {
    img.src = "assets/img/git-merge-16.svg";
    img.alt = "PR merged";
  } else {
    img.src = "assets/img/git-pull-request-closed-16.svg";
    img.alt = "PR closed";
  }
  return img;
}

export function repoHeader(repoName) {
  const div = document.createElement("div");
  div.className = "repo-header";

  const icon = document.createElement("img");
  icon.src = "assets/img/repo-16.svg";
  icon.alt = "Repo icon";
  icon.width = 16;
  icon.height = 16;
  icon.className = "repo-icon";

  const a = document.createElement("a");
  a.href = `https://github.com/${repoName}`;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.textContent = repoName;
  a.className = "repo-link";

  div.append(icon, a);
  return div;
}
