## Conference Networking Bot

Node.js + Telegram bot + MongoDB + Socket.IO second screen for conferences and communities.

### Requirements

- Node.js ≥ 18 (for local runs)
- Docker & docker-compose (for quick deploy)
- MongoDB ≥ 5 (if running without Docker)

### Environment variables

Set these variables (locally via your shell or a `.env` file that is **not committed**):

- `TELEGRAM_BOT_TOKEN` — Telegram bot token
- `MONGODB_URI` — MongoDB connection string
- `SECOND_SCREEN_API_KEY` — secret key for second screen REST + Socket.IO
- `MAIN_ADMIN_TELEGRAM_IDS` — comma-separated list of Telegram IDs for main admins
- `PORT` — (optional) HTTP port, default `3000`
- `BASE_URL` or `SERVER_URL` — (optional) Base URL for second screen links in bot, default `http://localhost:3000`

For `docker-compose`, you can put them into a `.env` file near `docker-compose.yml`.

### Run locally (without Docker)

```bash
npm install

# export env vars or use a local .env file
export TELEGRAM_BOT_TOKEN=...
export MONGODB_URI=mongodb://user:pass@localhost:27017/conference_networking
export SECOND_SCREEN_API_KEY=some-long-random-string

npm run dev
```

The server will start on `http://localhost:3000`.

- Healthcheck: `GET /health`
- Second screen page (HTML): `GET /second-screen/<conferenceCode>?key=<SECOND_SCREEN_API_KEY>`
- Second screen REST API (protected): `GET /conference/:code/...` with header `X-SECOND-SCREEN-KEY: SECOND_SCREEN_API_KEY`

### Run with Docker (recommended for quick demo)

1. Create a `.env` file near `docker-compose.yml`:

```bash
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
SECOND_SCREEN_API_KEY=your-second-screen-key
MAIN_ADMIN_TELEGRAM_IDS=123456789
MONGO_ROOT_USER=root
MONGO_ROOT_PASSWORD=example
```

2. Build and start:

```bash
docker-compose up --build
```

This will:

- start MongoDB on port `27017`
- build and run the app on port `3000`

### Telegram bot usage (short)

- `/start` — registration + краткая справка
- `/my_conferences` — список ваших конференций
- `/create_conference <название>` — создать конференцию (main / conference admin)
- `/join <код>` — присоединиться к конференции
- `/end_conference <код>` — завершить конференцию (main / conference admin)
- `/set_conf_admin <код> <telegramId>` — назначить конференционного админа (main)
- `/unset_conf_admin <код> <telegramId>` — снять админа (main)
- `/ask <код> <вопрос>` — задать вопрос
- `/mod_questions <код>` — список вопросов на модерации (админы)
- `/approve_question <код> <questionId>` — одобрить вопрос (админы)
- `/reject_question <код> <questionId>` — отклонить вопрос (админы)
- `/set_slide <код> <url> [заголовок]` — задать слайд на второй экран (админы)
- `/clear_slide <код>` — убрать слайд (админы)

### Second Screen

Open in browser or WebView:

- `http(s)://<host>/second-screen/<conferenceCode>?key=<SECOND_SCREEN_API_KEY>`

It will:

- subscribe to Socket.IO with the same key
- show approved Q&A in real time
- show the current slide/URL set by admins


