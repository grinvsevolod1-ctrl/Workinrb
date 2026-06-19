#!/bin/bash
cd /var/www/workinrb/bot
source .env.local 2>/dev/null || true
export TELEGRAM_BOT_TOKEN TELEGRAM_CHAT_ID_1 TELEGRAM_CHAT_ID_2
exec python3 telegram_support_bot.py
