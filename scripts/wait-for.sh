#!/usr/bin/env sh

set -eu

if [ "$#" -lt 1 ]; then
	echo "Usage: $0 <url> [timeout_seconds]" >&2
	echo "   or: $0 <host> <port> [timeout_seconds]" >&2
	exit 1
fi

MODE="tcp"
TIMEOUT="30"

case "$1" in
http://* | https://*)
	MODE="http"
	URL="$1"
	TIMEOUT="${2:-30}"
	;;
*)
	if [ "$#" -lt 2 ]; then
		echo "Usage: $0 <host> <port> [timeout_seconds]" >&2
		exit 1
	fi
	HOST="$1"
	PORT="$2"
	TIMEOUT="${3:-30}"
	;;
esac

START_TIME="$(date +%s)"

while true; do
	if [ "$MODE" = "http" ]; then
		if curl --silent --show-error --fail "$URL" >/dev/null 2>&1; then
			echo "Service available at ${URL}"
			exit 0
		fi
	else
		if nc -z "$HOST" "$PORT" >/dev/null 2>&1; then
			echo "Service available at ${HOST}:${PORT}"
			exit 0
		fi
	fi

	NOW="$(date +%s)"
	ELAPSED="$((NOW - START_TIME))"
	if [ "$ELAPSED" -ge "$TIMEOUT" ]; then
		if [ "$MODE" = "http" ]; then
			echo "Timed out waiting for ${URL}" >&2
		else
			echo "Timed out waiting for ${HOST}:${PORT}" >&2
		fi
		exit 1
	fi

	sleep 1
done
