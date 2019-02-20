#!/bin/bash

export MIX_ENV=prod
export PORT=4793

echo "Stopping old copy of app, if any..."

_build/prod/rel/unogame/bin/unogame stop || true

echo "Starting app..."

# Start to run in background from shell.
#_build/prod/rel/uno/bin/uno start

# Foreground for testing and for systemd
_build/prod/rel/unogame/bin/unogame foreground


