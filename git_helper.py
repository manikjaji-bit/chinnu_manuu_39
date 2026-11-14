import os
import sys
from dulwich import porcelain
from dulwich.repo import Repo

REPO_DIR = os.path.abspath(os.path.dirname(__file__))

def init_and_commit():
    git_dir = os.path.join(REPO_DIR, ".git")
    if not os.path.exists(git_dir):
        print(f"Initializing Git repo in {REPO_DIR}...")
        repo = porcelain.init(REPO_DIR)
    else:
        repo = Repo(REPO_DIR)
    
    print("Adding files (respecting .gitignore)...")
    # dulwich porcelain.add automatically respects .gitignore if IgnoreFilterManager is used or porcelain.add
    # Let's add all files
    porcelain.add(REPO_DIR)
    
    # Check status
    status = porcelain.status(REPO_DIR)
    print(f"Staged: {len(status.staged['add']) + len(status.staged['modify'])} files")
    print(f"Untracked: {len(status.untracked)} files")
    
    # Commit
    print("Committing changes...")
    author = b"manikjaji-bit <manikjaji-bit@users.noreply.github.com>"
    commit_id = porcelain.commit(
        REPO_DIR,
        message=b"feat: Campus Guardian - Self-Healing AI Smart Campus Ecosystem\n\n- Full-stack FastAPI + React 19 / TypeScript / Vite / Tailwind CSS v4\n- Student, Maintenance Staff, Administrator dashboards\n- Automated AI Vision diagnostics and routing\n- Standout before/after photographic resolution verification\n- Predictive recurring failure engine & Campus Health Score (0-100)\n- Leaflet OpenStreetMap GIS interactive map\n- AI Maintenance Assistant conversational copilot",
        author=author,
        committer=author
    )
    print(f"Committed successfully! Commit SHA: {commit_id.decode() if isinstance(commit_id, bytes) else commit_id}")

    # Set branch to main
    try:
        porcelain.branch_create(REPO_DIR, b"main")
    except Exception as e:
        print(f"Branch note: {e}")
    
    # Update HEAD to refs/heads/main
    repo.refs.set_symbolic_ref(b"HEAD", b"refs/heads/main")
    print("HEAD set to refs/heads/main")
    
    # Add remote
    remote_url = "https://github.com/manikjaji-bit/chinnu_manuu_39.git"
    try:
        porcelain.remote_add(REPO_DIR, "origin", remote_url)
        print(f"Remote origin added: {remote_url}")
    except Exception as e:
        print(f"Remote note: {e}")

if __name__ == "__main__":
    init_and_commit()
