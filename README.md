# Spotify Clone

## Ishga tushirish

Node.js 20 yoki undan yangiroq versiyasini o'rnating. API serveri va Vite
dasturini bitta komandada ishga tushirish uchun:

```sh
npm run dev:full
```

Yoki API serveri va Vite dasturini alohida terminallarda ishga tushiring:

```sh
npm run server
```

```sh
npm run dev
```

Vite `/api`, `/songs` va `/library` so'rovlarini backend'ga yo'naltiradi.
Standart port `3002`; boshqa port uchun `API_PORT` muhit o'zgaruvchisini
o'rnating.

## Hisob va autentifikatsiya API

- `POST /api/auth/signup` — `{ "name", "email", "password" }` yuborib hisob
  yaratadi va foydalanuvchini tizimga kiritadi.
- `POST /api/auth/signin` — `{ "email", "password" }` bilan kiradi.
- `GET /api/auth/session` — joriy kirish holatini qaytaradi.
- `POST /api/auth/signout` — joriy sessiyani tugatadi.

Parollar scrypt bilan salt qo'shib xeshlanadi. Sessiya `HttpOnly`,
`SameSite=Lax` cookie orqali uzatiladi. Foydalanuvchi yozuvlari maxfiy,
Git'ga kiritilmaydigan `.data/users.json` faylida saqlanadi; sessiyalar backend
qayta ishga tushganda tugaydi. Demo serverini ishlab chiqarish muhiti uchun
mo'ljallangan, ko'p serverli yoki ommaviy foydalaniladigan autentifikatsiya
xizmati sifatida ishlatmang.

## Kutubxona API

Sevimli qo'shiqlar va foydalanuvchi pleylistlari autentifikatsiyalangan
foydalanuvchiga tegishli bo'lib, `.data/libraries.json` faylida saqlanadi:

- `GET /api/library` — sevimli qo'shiqlar va pleylistlarni qaytaradi.
- `POST /api/library/liked` — `{ "songId" }` bilan katalog qo'shig'ini
  sevimlilarga qo'shadi; qidiruvdan topilgan trek uchun so'rovga `"song"`
  metama'lumotlari ham qo'shiladi.
- `DELETE /api/library/liked/:songId` — sevimlilardan qo'shiqni olib tashlaydi.
- `POST /api/library/playlists` — `{ "name" }` bilan pleylist yaratadi.
- `POST /api/library/playlists/:id/songs` — `{ "songId" }` va qidiruvdan
  topilgan trek uchun `"song"` metama'lumotlari bilan pleylistga qo'shadi.

## Rasmiy musiqa preview API

- `GET /api/music/search?language=uz` — Apple iTunes Search API'dan o'zbekcha
  ommabop ijrochilarni qidiradi.
- `GET /api/music/search?language=ru` — ruscha katalogni qidiradi.
- `GET /api/music/search?language=en` — inglizcha katalogni qidiradi.
- Istalgan tilga `&q=artist%20or%20song` qo'shib aniq qo'shiq/ijrochini
  qidirish mumkin. Javob `songs` ro'yxatini beradi; preview bo'lmagan natijalar
  ijro etiladigan katalogga kiritilmaydi.
- Faqat katalog rasmiy ravishda taqdim etgan 30 soniyalik previewlar ijro
  qilinadi. Player preview tugagach to'xtaydi, to'liq qo'shiq esa Apple Music
  havolasi orqali ochiladi.
- `/api/music/preview?url=...` Apple preview oqimini saqlamasdan va keshlamasdan
  uzatadi; `Range` so'rovlari ham ishlaydi. Faqat Apple preview audio CDN domeni
  va preview fayl yo'liga ruxsat beriladi.
- Sevimli va playlistga qo'shilgan trek metama'lumotlari `.data/libraries.json`
  faylida saqlanadi.

Ilova brauzerning afzal ko'rgan tilini (`English`, `Русский`, `O‘zbekcha`)
avtomatik tanlaydi. Tilni yon paneldagi ro'yxatdan almashtirish mumkin.

## Musiqa va litsenziyalar

`db.json` ichidagi sakkizta demo yozuv Wikimedia Commons'da CC0 1.0 sifatida
e'lon qilingan. Rasmiy katalogdan kelgan qo'shiqlar esa Apple Music taqdim
etgan qisqa preview bo'lib, trek sahifasiga havola bilan ko'rsatiladi. Trek
IDlarini o'zgartirmang: ular foydalanuvchilarning saqlangan sevimlilari va
pleylistlarida ishlatiladi.

| Trek | Ijrochi | Manba |
| --- | --- | --- |
| Why Oh You Are L O V E | Dancefloor is Lava | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Dancefloor_is_Lava_-_01_-_Why_Oh_You_Are_L_O_V_E.ogg) |
| Exquisite Music | Greg Walker | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Exquisite_Music_by_Greg_Walker.ogg) |
| Kanun music and singing during the 5th anniversary of Wikimedia Armenia | Benoît Prieur | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Kanun_music_and_singing_during_the_5th_anniversary_of_Wikimedia_Armenia.ogg) |
| Alien Spaceship Atmosphere | Kevin MacLeod | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Kevin_MacLeod_-_Alien_Spaceship_Atmosphere_(cc0).ogg) |
| Merfolk Music Box | Komiku | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Komiku_-_46_-_Merfolk_Music_Box.ogg) |
| Coexistenz | Loyalty Freak Music | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Loyalty_Freak_Music_-_01_-_Coexistenz.ogg) |
| Everyone Is So Alive | Loyalty Freak Music | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Loyalty_Freak_Music_-_01_-_Everyone_is_so_alive.ogg) |
| Go to the Picnic | Loyalty Freak Music | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Loyalty_Freak_Music_-_01_-_Go_to_the_Picnic.ogg) |

Katalogdagi sakkiz CC0 trek `db.json` ichida lokal demo qo'shiqlar sifatida
qoladi. Bosh sahifa esa o'zbek, rus va ingliz tilidagi ommabop qo'shiqlar uchun
Apple Music rasmiy preview katalogidan foydalanadi.
