# Handover

Built with electron

## CONCEPT

1. Announce service via mdns / dns-sd
2. Subscribe to new notices
2. * GET /notice
3. * or SSE
4. On new notice, call capture relevant data and propose paste and listen again
5. On paste call GET /latest

## TODO

- Evaluate alternative discovery mechanism (lighter, standards, e.g. mdns)
- Evaluate mdns to announce http service
- Evaluate anti-firewall strategies
- Windows compatibility
- Linux compatibility
- App Store releases
- Web UI
- Improve icons incl. app starter icon
- Stack history
