#!/usr/bin/env python3
"""Environment smoke test: verifies the sandbox can run code and reach the repo."""

import platform
import subprocess
import sys


def check_python() -> str:
    assert sys.version_info >= (3, 8), f"python too old: {sys.version}"
    return f"python {platform.python_version()} on {platform.system()}"


def check_arithmetic() -> str:
    total = sum(n * n for n in range(1, 11))
    assert total == 385, f"expected 385, got {total}"
    return f"sum of squares 1..10 = {total}"


def check_git() -> str:
    branch = subprocess.run(
        ["git", "rev-parse", "--abbrev-ref", "HEAD"],
        capture_output=True,
        text=True,
        check=True,
    ).stdout.strip()
    assert branch, "could not resolve current branch"
    return f"git branch = {branch}"


def main() -> int:
    checks = (check_python, check_arithmetic, check_git)
    failures = 0

    for check in checks:
        try:
            print(f"[ok]   {check.__name__}: {check()}")
        except Exception as exc:
            failures += 1
            print(f"[fail] {check.__name__}: {exc}")

    print(f"\n{len(checks) - failures}/{len(checks)} checks passed")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
