# Cursor_Cloud

use cursor in cloud

## Smoke test

`smoke_test.py` verifies that the cloud sandbox can execute code, do basic
computation, and read git state. Run it with:

```bash
python3 smoke_test.py
```

It exits with `0` when every check passes and `1` otherwise, so it can be
dropped into CI as-is.
