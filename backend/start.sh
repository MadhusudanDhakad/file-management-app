#!/usr/bin/env bash
gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT