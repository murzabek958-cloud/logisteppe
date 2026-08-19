# LogiSteppe — Mangystau Cargo Platform

Хакатон жобасы. Маңғыстау облысындағы жүк тасымалын оңтайландыруға арналған платформа.

---

## Жобаның мақсаты

Маңғыстау облысындағы жүк тасымалдаушылар мен жүк жіберушілерді бір платформада біріктіру. Бос жүріс (empty miles) азайту, LTL (Less-than-Truckload) топтастыру, және маршруттарды автоматты сәйкестендіру арқылы логистика шығынын 30%-ға дейін қысқарту.

---

## Тірі сілтемелер

- **Backend API:** https://web-production-3ec3f.up.railway.app
- **Frontend:** https://frontend-myrzabek.vercel.app
- **API Docs (Swagger):** https://web-production-3ec3f.up.railway.app/docs

---

## Тест аккаунттары

| Рөл | Email | Password |
|-----|-------|----------|
| 📦 Shipper (жүк жіберуші) | test.shipper01@example.com | TestShip123! |
| 🧭 Dispatcher (диспетчер) | test.dispatcher01@example.com | TestDispatch123! |
| 🚚 Carrier (тасымалдаушы) | test.carrier01@example.com | TestCarrier123! |

---

## Технологиялар

**Backend**
- Python 3.11
- FastAPI
- SQLAlchemy + PostgreSQL
- JWT аутентификация (python-jose)
- Passlib + bcrypt
- Railway (deploy)

**Frontend**
- React 18 + Vite
- React Router v6
- Axios
- Leaflet / React-Leaflet (карта)
- Tailwind CSS
- Vercel (deploy)

---

## Алгоритмдер

**1. Баға есептегіш (`price_estimator.py`)**
Қашықтық, жүк салмағы, маусым (жаз коэффициенті), және жүк түріне (тез бұзылатын) қарай баға есептейді.

**2. Маршрут калькуляторы (`route_calculator.py`)**
Маңғыстаудың нақты қалалары арасындағы қашықтық, жол сапасы (асфальт / жартылай / топырақ), жанармай шығыны және уақыт есептейді. Ыстық ауа-райында тез бұзылатын жүк үшін ескерту береді.

**3. Backhaul Matcher (`backhaul_matcher.py`)**
Тасымалдаушы жеткізіп болған соң, сол жерден кері бағытта pending тапсырыстарды тауып, бос қайтпауды қамтамасыз етеді.

**4. LTL топтастыру (`ltl_grouping.py`)**
Бір бағыттағы бірнеше кіші тапсырыстарды бір жүк көлігіне топтастырады.

---

## Рөлдер және мүмкіндіктер

**Shipper (жүк жіберуші)**
- Тапсырыс жасау (origin, destination, жүк түрі, салмақ, приоритет)
- Баға бағалауын автоматты алу
- Тапсырыс статусын қадағалау

**Carrier (тасымалдаушы)**
- Профиль тіркеу (көлік сыйымдылығы, орналасқан жер)
- Маршрут статусын жаңарту
- Орналасқан жерін жаңарту

**Dispatcher (диспетчер)**
- Тапсырысты тасымалдаушымен сәйкестендіру
- Маршрут жасау
- Аналитика және статистика көру

---

## Жоба структурасы

```
logisteppe/
├── Procfile                    # Railway deploy командасы
├── requirements.txt
├── backend/
│   ├── main.py                 # FastAPI app, CORS, router тіркеу
│   ├── auth.py                 # JWT токен, пароль хештеу
│   ├── database.py             # SQLAlchemy engine, session
│   ├── models.py               # DB кестелері (User, Order, Carrier, Route, Settlement)
│   ├── schemas.py              # Pydantic схемалары
│   ├── routers/
│   │   ├── auth.py             # /auth/register, /auth/login
│   │   ├── orders.py           # /orders CRUD
│   │   ├── carriers.py         # /carriers тіркеу, орын жаңарту
│   │   ├── routes.py           # /routes сәйкестендіру, статус
│   │   └── analytics.py        # /analytics/summary
│   └── algorithms/
│       ├── price_estimator.py
│       ├── route_calculator.py
│       ├── backhaul_matcher.py
│       └── ltl_grouping.py
└── frontend/
    ├── src/
    └── ...
```

---

## API эндпоинттары

| Метод | URL | Сипаттама |
|-------|-----|-----------|
| POST | /auth/register | Тіркелу |
| POST | /auth/login | Кіру |
| POST | /orders/ | Тапсырыс жасау |
| GET | /orders/ | Тапсырыстар тізімі |
| PATCH | /orders/{id}/status | Статус өзгерту |
| POST | /carriers/register | Тасымалдаушы тіркеу |
| GET | /carriers/available | Бос тасымалдаушылар |
| PATCH | /carriers/location | Орын жаңарту |
| POST | /routes/match/{order_id} | Маршрут сәйкестендіру |
| PATCH | /routes/{id}/status | Маршрут статусы |
| GET | /analytics/summary | Аналитика |

---

## Жергілікті іске қосу

```bash
# Backend
pip install -r backend/requirements.txt
DATABASE_URL=postgresql://... uvicorn backend.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

---

## Авторлар

LogiSteppe командасы — Хакатон 2026
