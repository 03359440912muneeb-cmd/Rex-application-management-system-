# Security

- The GUI never runs as root.
- The frontend never executes shell commands.
- System operations use fixed executables and separately supplied arguments.
- Package identifiers are validated before authorization.
- Privileged operations are initiated only through a PolicyKit authorization dialog.
- Passwords are never requested or stored.
- AppImages are inspected by filesystem metadata only and are never executed by the scanner.
- Destructive operations require explicit user confirmation in the UI before the backend is invoked.
