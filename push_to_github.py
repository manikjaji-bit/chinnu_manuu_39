import os
import sys
from dulwich import porcelain
from dulwich.repo import Repo

REPO_DIR = os.path.abspath(os.path.dirname(__file__))

def push_with_token(token: str):
    if not token or not token.strip():
        print("Error: No GitHub token provided.")
        return False
    
    token = token.strip()
    remote_with_token = f"https://{token}@github.com/manikjaji-bit/chinnu_manuu_39.git"
    
    print("Initiating push to https://github.com/manikjaji-bit/chinnu_manuu_39.git ...")
    try:
        porcelain.push(REPO_DIR, remote_with_token, [b"refs/heads/main:refs/heads/main"])
        print("\nSUCCESS! Successfully pushed all files and commits to main branch of:")
        print("https://github.com/manikjaji-bit/chinnu_manuu_39.git")
        return True
    except Exception as e:
        print(f"\nPush failed: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) > 1:
        token = sys.argv[1]
    else:
        token = os.environ.get("GITHUB_TOKEN", "")
        if not token:
            print("Please provide your GitHub Personal Access Token (PAT).")
            print("Usage: python push_to_github.py <YOUR_GITHUB_TOKEN>")
            sys.exit(1)
            
    success = push_with_token(token)
    sys.exit(0 if success else 1)
