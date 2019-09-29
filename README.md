# Репозиторий с проектом-домашним заданием для ШРИ-2019

Проект представляет из себя утилиту для работы с Git-репозиториями.

В папке [backend](src/backend) содержатся исходники бэкэнда.

В папке [ui](src/ui) содержатся исходники html-страниц.

## Запуск и просмотр

### UI

Запускается командой:
~~~
npm run start:ui
~~~
Разворачивает сервер на 8000 порту, который предоставляет доступ к статическим и html файлам.

**Ссылки на реализованные страницы:**
* 1440px
  - http://localhost:8000/1440/1.1
  - http://localhost:8000/1440/1.5
  - http://localhost:8000/1440/1.6
  - http://localhost:8000/1440/2.1
  - http://localhost:8000/1440/3.1
* 360px
  - http://localhost:8000/360/1.1
  - http://localhost:8000/360/1.5
  - http://localhost:8000/360/1.6
  - http://localhost:8000/360/2.1
  - http://localhost:8000/360/3.1

### Backend

Предоставляет API для работы UI.

Запускается командой:
~~~
npm run start:backend <путь до корня репозитория>
~~~
Разворачивает сервер на 3000 порту.

## Использованные технологии
* **pug.js** - для шаблонирования страниц. Шаблоны для pug лежат в директории `src/ui/templates`.
* **sass** - с помощью него более удобно получается разбивать проект на шаблонизированные файлы.<br/>
Также, я решил, что сделаю отдельные верстки для 1440 и 360 px. С помощью директив `@if` разносить разные верстки более удобно, т.к. общая часть кода лежит вместе.<br/>
Скомпилированные css файлы складываются в корневую директорию dist. Они компилируются автоматически сервером при обращении к странице.
* **prism.js** - подсветку кода для страницы 1.5 делал с помощью этой библиотеки.
* **express.js** - для компиляции pug-шаблонов, sass-файлов и предоставления статического контента.
* **node.js** - выше версии 10.