#!/usr/bin/env python3
"""
Telegram Support Bot для workinrb.top
- Сохранение истории чатов
- Подключение/отключение от диалогов
- Команды: /chats, /leave, /close, /history
"""
import os
import json
from datetime import datetime
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, MessageHandler, CallbackQueryHandler, filters, ContextTypes
from dotenv import load_dotenv

load_dotenv('/var/www/workinrb/.env.local')

TOKEN = os.getenv("TELEGRAM_BOT_TOKEN2", os.getenv("TELEGRAM_BOT_TOKEN"))
MANAGER_IDS = [
    int(os.getenv("TELEGRAM_CHAT_ID_1", "0")),
    int(os.getenv("TELEGRAM_CHAT_ID_2", "0"))
]
MANAGER_IDS = [mid for mid in MANAGER_IDS if mid != 0]

SESSIONS_FILE = "/var/www/workinrb/bot/sessions.json"
HISTORY_DIR = "/var/www/workinrb/bot/history"

sessions = {}  # {user_id: {"manager_id": int, "user_name": str, "created_at": str, "closed": bool}}
managers_online = set()


def is_manager(chat_id: int) -> bool:
    return chat_id in MANAGER_IDS


def load_sessions():
    global sessions
    try:
        with open(SESSIONS_FILE, "r") as f:
            sessions = json.load(f)
    except:
        sessions = {}


def save_sessions():
    with open(SESSIONS_FILE, "w") as f:
        json.dump(sessions, f, indent=2)


def get_history_file(user_id: str) -> str:
    """Путь к файлу истории конкретного диалога"""
    os.makedirs(HISTORY_DIR, exist_ok=True)
    return os.path.join(HISTORY_DIR, f"{user_id}.json")


def load_history(user_id: str) -> list:
    """Загрузить историю сообщений"""
    try:
        with open(get_history_file(user_id), "r") as f:
            return json.load(f)
    except:
        return []


def save_message(user_id: str, sender_type: str, sender_name: str, text: str):
    """Сохранить сообщение в историю"""
    history = load_history(user_id)
    history.append({
        "time": datetime.now().strftime("%d.%m.%Y %H:%M:%S"),
        "sender_type": sender_type,  # "client", "manager", "system"
        "sender_name": sender_name,
        "text": text
    })
    # Храним последние 200 сообщений
    history = history[-200:]
    with open(get_history_file(user_id), "w") as f:
        json.dump(history, f, indent=2, ensure_ascii=False)


def get_active_sessions():
    return {uid: s for uid, s in sessions.items() if not s.get("closed")}


def get_manager_keyboard(manager_id: int = None):
    active = get_active_sessions()
    if not active:
        return None
    keyboard = []
    for uid, s in active.items():
        connected = "🔗" if s.get("manager_id") == manager_id else ""
        other = "👤" if s.get("manager_id") and s.get("manager_id") != manager_id else ""
        status = connected or other or "⏳"
        # Показываем кол-во сообщений
        hist_len = len(load_history(uid))
        keyboard.append([InlineKeyboardButton(
            f"{status} {s.get('user_name', 'Клиент')} | {s.get('created_at', '?')} | {hist_len}📝",
            callback_data=f"connect_{uid}"
        )])
    
    bottom = [
        InlineKeyboardButton("🔄 Обновить", callback_data="refresh"),
        InlineKeyboardButton("📊 Статистика", callback_data="stats")
    ]
    keyboard.append(bottom)
    return InlineKeyboardMarkup(keyboard)


def get_client_keyboard(user_id: str):
    if user_id in sessions and not sessions[user_id].get("closed"):
        return InlineKeyboardMarkup([
            [InlineKeyboardButton("🔄 Всё ещё жду ответа", callback_data="ping_manager")],
            [InlineKeyboardButton("❌ Закрыть обращение", callback_data="close_request")]
        ])
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("📞 Связаться с менеджером", callback_data="request_manager")]
    ])


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat_id = update.effective_chat.id
    
    if is_manager(chat_id):
        managers_online.add(chat_id)
        keyboard = get_manager_keyboard(chat_id)
        active = get_active_sessions()
        text = "👋 Вы менеджер!\n\n"
        text += f"📊 Активных диалогов: {len(active)}\n"
        text += f"👥 Менеджеров онлайн: {len(managers_online)}\n\n"
        text += "Команды:\n"
        text += "/chats — список диалогов\n"
        text += "/history — история текущего диалога\n"
        text += "/leave — отключиться\n"
        text += "/close — закрыть диалог"
        await update.message.reply_text(text, reply_markup=keyboard)
    else:
        keyboard = get_client_keyboard(str(chat_id))
        await update.message.reply_text(
            "👋 Здравствуйте! Это поддержка WorkInRB.\n\n"
            "Нажмите кнопку ниже, чтобы задать вопрос менеджеру.",
            reply_markup=keyboard
        )


async def handle_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    chat_id = query.message.chat.id
    data = query.data
    
    if data == "request_manager":
        user_id = str(query.from_user.id)
        user_name = query.from_user.full_name or "Клиент"
        
        if user_id in sessions and not sessions[user_id].get("closed"):
            await query.edit_message_text("✅ Вы уже на связи! Просто напишите ваш вопрос.")
            return
        
        sessions[user_id] = {
            "manager_id": None,
            "user_name": user_name,
            "created_at": datetime.now().strftime("%d.%m %H:%M"),
            "closed": False
        }
        save_sessions()
        save_message(user_id, "system", "Система", "Клиент запросил подключение менеджера")
        
        for mid in MANAGER_IDS:
            try:
                keyboard = InlineKeyboardMarkup([[
                    InlineKeyboardButton("💬 Подключиться", callback_data=f"connect_{user_id}")
                ]])
                await context.bot.send_message(
                    mid,
                    f"🔔 <b>Новое обращение!</b>\n\n"
                    f"👤 {user_name}\n"
                    f"🆔 <code>{user_id}</code>\n"
                    f"⏰ {datetime.now().strftime('%H:%M')}",
                    parse_mode="HTML",
                    reply_markup=keyboard
                )
            except Exception as e:
                print(f"Ошибка уведомления {mid}: {e}")
        
        await query.edit_message_text("✅ Менеджер скоро ответит! Напишите ваш вопрос прямо здесь.")
    
    elif data == "refresh":
        keyboard = get_manager_keyboard(chat_id)
        active = get_active_sessions()
        text = f"📋 Активных диалогов: {len(active)}"
        await query.edit_message_text(text, reply_markup=keyboard)
    
    elif data == "stats":
        active = get_active_sessions()
        total = len(sessions)
        text = f"📊 <b>Статистика:</b>\n\n"
        text += f"🔴 Активных: {len(active)}\n"
        text += f"📝 Всего: {total}\n"
        text += f"👥 Менеджеров: {len(managers_online)}\n\n"
        text += "<b>Активные диалоги:</b>\n"
        for uid, s in active.items():
            hist_len = len(load_history(uid))
            manager = s.get("manager_id")
            status = "🔗 Подключён" if manager else "⏳ Ожидает"
            text += f"• {s['user_name']} — {status} | {hist_len} сообщ.\n"
        await query.edit_message_text(text, parse_mode="HTML")
    
    elif data.startswith("connect_"):
        user_id = data.replace("connect_", "")
        if is_manager(chat_id) and user_id in sessions:
            # Отключаемся от предыдущего
            for uid, s in sessions.items():
                if s.get("manager_id") == chat_id:
                    try:
                        await context.bot.send_message(int(uid), "🔄 Менеджер переключился на другой диалог.")
                    except:
                        pass
                    save_message(uid, "system", "Система", "Менеджер отключился от диалога")
                    sessions[uid]["manager_id"] = None
            
            sessions[user_id]["manager_id"] = chat_id
            save_sessions()
            save_message(user_id, "system", "Система", "Менеджер подключился к диалогу")
            
            # Показываем последние 10 сообщений истории
            history = load_history(user_id)
            history_text = ""
            if history:
                history_text = "\n\n<b>Последние сообщения:</b>\n"
                for msg in history[-10:]:
                    prefix = "👤" if msg["sender_type"] == "client" else "💬" if msg["sender_type"] == "manager" else "⚙️"
                    history_text += f"{prefix} <i>{msg['sender_name']}:</i> {msg['text'][:50]}\n"
            
            await query.edit_message_text(
                f"✅ Вы подключились к {sessions[user_id]['user_name']}.{history_text}\n\n"
                f"/history — вся история\n"
                f"/leave — отключиться",
                parse_mode="HTML"
            )
            
            try:
                await context.bot.send_message(int(user_id), "✅ Менеджер подключился! Задавайте ваш вопрос.")
            except:
                pass
    
    elif data == "ping_manager":
        user_id = str(query.from_user.id)
        if user_id in sessions:
            save_message(user_id, "system", "Система", "Клиент ожидает ответа")
            await query.edit_message_text("⏳ Ожидайте, менеджер скоро ответит.")
    
    elif data == "close_request":
        user_id = str(query.from_user.id)
        if user_id in sessions:
            sessions[user_id]["closed"] = True
            save_sessions()
            save_message(user_id, "system", "Система", "Клиент закрыл обращение")
            for mid in MANAGER_IDS:
                try:
                    await context.bot.send_message(mid, f"❌ Клиент {sessions[user_id]['user_name']} закрыл обращение.")
                except:
                    pass
            await query.edit_message_text("✅ Обращение закрыто. Спасибо!")


async def cmd_chats(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not is_manager(update.effective_chat.id):
        return
    keyboard = get_manager_keyboard(update.effective_chat.id)
    active = get_active_sessions()
    text = f"📋 Активных диалогов: {len(active)}"
    await update.message.reply_text(text, reply_markup=keyboard)


async def cmd_history(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Показать историю текущего диалога"""
    chat_id = update.effective_chat.id
    if not is_manager(chat_id):
        return
    
    # Ищем подключённого клиента
    user_id = None
    for uid, s in sessions.items():
        if s.get("manager_id") == chat_id and not s.get("closed"):
            user_id = uid
            break
    
    if not user_id:
        await update.message.reply_text("⚠️ Вы не подключены к диалогу. /chats — список диалогов")
        return
    
    history = load_history(user_id)
    if not history:
        await update.message.reply_text("📝 История пуста.")
        return
    
    text = f"📝 <b>История диалога с {sessions[user_id]['user_name']}:</b>\n\n"
    for msg in history[-50:]:  # Последние 50 сообщений
        time = msg['time'].split()[1]  # Только время
        prefix = "👤" if msg["sender_type"] == "client" else "💬" if msg["sender_type"] == "manager" else "⚙️"
        text += f"{prefix} <b>{msg['sender_name']}</b> <i>{time}</i>\n{msg['text']}\n\n"
    
    # Разбиваем на части если слишком длинное
    if len(text) > 4000:
        parts = [text[i:i+4000] for i in range(0, len(text), 4000)]
        for part in parts:
            await update.message.reply_text(part, parse_mode="HTML")
    else:
        await update.message.reply_text(text, parse_mode="HTML")


async def cmd_leave(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat_id = update.effective_chat.id
    if not is_manager(chat_id):
        return
    
    for uid, s in sessions.items():
        if s.get("manager_id") == chat_id:
            sessions[uid]["manager_id"] = None
            save_sessions()
            save_message(uid, "system", "Система", "Менеджер отключился")
            try:
                await context.bot.send_message(int(uid), "🔄 Менеджер отключился. С вами свяжется другой специалист.")
            except:
                pass
            await update.message.reply_text("✅ Вы отключились.\n/chats — список диалогов")
            return
    
    await update.message.reply_text("⚠️ Вы не подключены к диалогу.")


async def cmd_close(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat_id = update.effective_chat.id
    if not is_manager(chat_id):
        return
    
    for uid, s in sessions.items():
        if s.get("manager_id") == chat_id:
            sessions[uid]["closed"] = True
            save_sessions()
            save_message(uid, "system", "Система", "Менеджер закрыл диалог")
            try:
                await context.bot.send_message(int(uid), "✅ Спасибо за обращение! Диалог закрыт.")
            except:
                pass
            await update.message.reply_text("✅ Диалог закрыт.\n/chats — список")
            return
    
    await update.message.reply_text("⚠️ Вы не подключены к диалогу.")


async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    msg = update.message
    if not msg or not msg.text:
        return
    
    chat_id = update.effective_chat.id
    sender_name = msg.from_user.full_name or "Пользователь"
    
    # МЕНЕДЖЕР → Клиенту
    if is_manager(chat_id):
        managers_online.add(chat_id)
        target = None
        for uid, s in sessions.items():
            if s.get("manager_id") == chat_id and not s.get("closed"):
                target = uid
                break
        
        if target:
            save_message(target, "manager", sender_name, msg.text)
            try:
                await context.bot.send_message(
                    int(target),
                    f"💬 <b>{sender_name}:</b>\n{msg.text}",
                    parse_mode="HTML"
                )
            except Exception as e:
                await msg.reply_text(f"❌ Ошибка: {e}")
        else:
            keyboard = get_manager_keyboard(chat_id)
            await msg.reply_text("⚠️ Вы не подключены к диалогу.", reply_markup=keyboard)
    
    # КЛИЕНТ → Менеджерам
    elif str(chat_id) in sessions:
        s = sessions[str(chat_id)]
        if s.get("closed"):
            keyboard = get_client_keyboard(str(chat_id))
            await msg.reply_text("Обращение закрыто.", reply_markup=keyboard)
            return
        
        save_message(str(chat_id), "client", sender_name, msg.text)
        manager_id = s.get("manager_id")
        sent_to = []
        
        if manager_id:
            try:
                await context.bot.send_message(manager_id, f"📩 <b>{s['user_name']}:</b>\n{msg.text}", parse_mode="HTML")
                sent_to.append(manager_id)
            except:
                pass
        
        for mid in MANAGER_IDS:
            if mid not in sent_to:
                try:
                    keyboard = InlineKeyboardMarkup([[
                        InlineKeyboardButton("💬 Подключиться", callback_data=f"connect_{chat_id}")
                    ]])
                    await context.bot.send_message(
                        mid,
                        f"📩 <b>{s['user_name']}:</b>\n{msg.text}",
                        parse_mode="HTML",
                        reply_markup=keyboard
                    )
                except:
                    pass
    
    else:
        keyboard = get_client_keyboard(str(chat_id))
        await msg.reply_text("👋 Нажмите кнопку ниже.", reply_markup=keyboard)


def main():
    load_sessions()
    app = Application.builder().token(TOKEN).build()
    
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("chats", cmd_chats))
    app.add_handler(CommandHandler("history", cmd_history))
    app.add_handler(CommandHandler("leave", cmd_leave))
    app.add_handler(CommandHandler("close", cmd_close))
    app.add_handler(CallbackQueryHandler(handle_callback))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    
    print(f"🤖 Бот запущен!")
    print(f"👥 Менеджеры: {MANAGER_IDS}")
    print(f"📊 Активных диалогов: {len(get_active_sessions())}")
    app.run_polling()


if __name__ == "__main__":
    main()
