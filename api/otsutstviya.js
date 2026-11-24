/**
 * Обработчик приложения «ПРОФЭНЕРДЖИ — отсутствия» для Vercel.
 * Собран из панель.html — правьте страницу, а не этот файл.
 *
 * Токенов не хранит, в Битрикс сам не ходит, данных о сотрудниках
 * не держит: страница работает в кадре портала и спрашивает всё
 * у самого Битрикса от имени того, кто смотрит. Поэтому наружу
 * не уходит ни одной фамилии.
 */
const СТРАНИЦА = `<!doctype html><html lang="ru"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Отсутствия</title>
<style>
  :root { color-scheme: light dark; }
  body { font: 13.5px/1.5 "Helvetica Neue", Arial, system-ui, sans-serif;
         margin: 0; padding: 12px; color: #1b1d22; background: #fff; }
  @media (prefers-color-scheme: dark) { body { color: #e8e6e1; background: #1f2126; } }
  .строка { display: flex; gap: 8px; align-items: baseline; margin-bottom: 6px; flex-wrap: wrap; }
  .метка { display: inline-flex; align-items: center; gap: 5px; font-weight: 600;
           font-size: 12px; padding: 2px 9px; border-radius: 11px; white-space: nowrap; }
  .метка::before { content: ""; width: 7px; height: 7px; border-radius: 50%; background: currentColor; }
  .вотпуске { color: #c0453f; background: rgba(192,69,63,.14); }
  .вотвот  { color: #d2762c; background: rgba(210,118,44,.14); }
  .скоро   { color: #b8900f; background: rgba(214,165,22,.16); }
  .замена { color: #6b6f75; font-size: 12.5px; }
  .тихо { color: #6b6f75; }
  .тревога { margin-top: 10px; padding: 9px 11px; border-left: 3px solid #c0453f;
             background: rgba(192,69,63,.09); border-radius: 0 5px 5px 0; }

  /* Гант: сроки задачи и отпусков на одной шкале. Недельные засечки —
     чтобы расстояние читалось глазом, а не вычиталось в уме. */
  .гант { margin: 12px 0 2px; }
  .шкала { position: relative; height: 15px; margin-bottom: 3px; }
  .неделя { position: absolute; top: 0; font-size: 10px; color: #8b8f95;
            transform: translateX(-50%); white-space: nowrap; }
  .полоса-ряд { position: relative; height: 20px; margin-bottom: 9px;
                background: rgba(127,127,127,.10); border-radius: 4px; }
  .засечка { position: absolute; top: 0; bottom: 0; width: 1px;
             background: rgba(127,127,127,.22); }
  .отрезок { position: absolute; top: 3px; height: 14px; border-radius: 3px;
             display: flex; align-items: center; padding: 0 5px;
             font-size: 10px; color: #fff; white-space: nowrap; overflow: hidden; }
  /* Черты сегодняшнего дня и срока задачи. Были в два пикселя —
     на фоне полос их почти не было видно, и цвета не различались.
     Теперь толще, поверх полос и с кружком сверху: кружок читается
     даже там, где черта проходит по залитому отрезку. */
  .сегодня-черта, .срок-черта {
    position: absolute; top: -4px; bottom: -4px; width: 3px;
    border-radius: 2px; z-index: 2; margin-left: -1px;
    box-shadow: 0 0 0 1px rgba(255,255,255,.75);
  }
  .сегодня-черта::after, .срок-черта::after {
    content: ""; position: absolute; left: 50%; top: -3px;
    width: 9px; height: 9px; border-radius: 50%;
    transform: translateX(-50%); background: inherit;
    box-shadow: 0 0 0 1.5px rgba(255,255,255,.85);
  }
  .сегодня-черта { background: #2f6fb5; }
  .срок-черта { background: #c0453f; }
  .подпись-ряда { font-size: 11px; color: #6b6f75; margin: 0 0 2px; }
  .пояснение { font-size: 10.5px; color: #8b8f95; margin: 4px 0 0;
               display: flex; gap: 10px; flex-wrap: wrap; }
  .пояснение i { font-style: normal; display: inline-flex; align-items: center; gap: 4px; }
  .пояснение i::before { content: ""; width: 9px; height: 9px; border-radius: 50%;
                         background: currentColor; }
  .пояснение i.недели::before { width: 9px; height: 3px; border-radius: 2px; }
  h2 { font-size: 12px; text-transform: uppercase; letter-spacing: .06em;
       color: #6b6f75; margin: 0 0 8px; font-weight: 600; }
</style></head><body>
<div id="тут" class="тихо">Смотрю…</div>
<script src="https://api.bitrix24.com/api/v1/"></script>
<script>
// Данные берём у портала: ни одна фамилия не покидает Битрикс.
// Отпуска лежат событиями в календаре компании — их туда кладёт
// наш бот, и в описании каждого стоит идентификатор сотрудника.
var ОТМЕТКА = /ид:\\s*(\\d+)/;
//: Что панель успела выяснить. Печатается внизу мелким серым —
//: это единственный способ отличить «никто не в отпуске»
//: от «ничего не загрузилось».
var сведения = "";
// ВРЕМЕННО 14 вместо 7: на показе владельцу. Вернуть 7.
var ПОКАЗЫВАЕМ_ЗА = 14;

function зов(метод, доводы) {
  return new Promise(function (готово, беда) {
    BX24.callMethod(метод, доводы || {}, function (ответ) {
      if (ответ.error()) {
        беда(new Error(ответ.error_description() || ответ.error()));
      } else {
        готово(ответ.data());
      }
    });
  });
}

function день(строка) {
  if (!строка) return null;
  // Портал отдаёт дату либо как «2026-10-15», либо как
  // «15.10.2026 00:00:00» — зависит от настроек региона. Второй вид
  // браузер сам не разбирает, поэтому разбираем руками.
  var русская = /^(\\d{2})\\.(\\d{2})\\.(\\d{4})/.exec(строка);
  var д = русская
    ? new Date(+русская[3], +русская[2] - 1, +русская[1])
    : new Date(строка);
  return isNaN(д) ? null : д;
}

function коротко(д) {
  return ("0" + д.getDate()).slice(-2) + "." + ("0" + (д.getMonth() + 1)).slice(-2);
}

function состояние(с, по, сегодня) {
  if (сегодня > по) return null;
  var осталось = Math.round((с - сегодня) / 86400000);
  if (сегодня >= с) return { вид: "вотпуске", слова: "В отпуске до " + коротко(по) };
  if (осталось > ПОКАЗЫВАЕМ_ЗА) return null;
  if (осталось > 2) return { вид: "скоро", слова: "Отпуск " + коротко(с) + "–" + коротко(по) };
  var когда = осталось === 1 ? "завтра" : осталось === 0 ? "сегодня" : "через " + осталось + " дн.";
  return { вид: "вотвот", слова: "Отпуск " + когда + " · до " + коротко(по) };
}

// Если портал почему-то не ответил, панель не должна остаться
// немой: молчащий блок человек читает как поломку и перестаёт
// ему верить, даже когда тот работает.
setTimeout(function () {
  var тут = document.getElementById("тут");
  if (тут && /^Смотрю/.test(тут.textContent || "")) {
    тут.textContent = "Портал не ответил. Обновите страницу задачи.";
    подогнать();
  }
}, 8000);

BX24.init(function () {
  var настройки = (BX24.placement && BX24.placement.info()) || {};
  var свои = настройки.options || {};
  var идЗадачи = свои.taskId || свои.ID || свои.id;
  var сегодня = new Date(); сегодня.setHours(0, 0, 0, 0);
  var отрезок = new Date(сегодня.getTime() + 180 * 86400000);

  Promise.all([
    идЗадачи ? зов("tasks.task.get", { taskId: идЗадачи,
        select: ["ID", "TITLE", "RESPONSIBLE_ID", "CREATED_BY",
                 "ACCOMPLICES", "AUDITORS", "DEADLINE"] }) : null,
    зов("calendar.event.get", { type: "company_calendar", ownerId: 0,
        from: сегодня.toISOString().slice(0, 10), to: отрезок.toISOString().slice(0, 10) })
  ]).then(function (пара) {
    var задача = пара[0] && пара[0].task ? пара[0].task : null;
    var события = пара[1] || [];

    var поЛюдям = {};
    события.forEach(function (с) {
      var метка = ОТМЕТКА.exec(с.DESCRIPTION || "");
      if (!метка) return;
      var начало = день(с.DATE_FROM), конец = день(с.DATE_TO);
      if (!начало || !конец) return;
      начало.setHours(0, 0, 0, 0); конец.setHours(0, 0, 0, 0);
      поЛюдям[метка[1]] = { начало: начало, конец: конец, описание: с.DESCRIPTION || "" };
    });

    // Строка состояния: по ней видно, что панель жива и что именно
    // она увидела. Молчащий блок неотличим от сломанного, и три
    // захода подряд ушли на то, чтобы это понять.
    сведения = "задача " + (идЗадачи || "не передана") +
               " · отпусков в календаре: " + Object.keys(поЛюдям).length;

    кто_нужен(задача).then(function (люди) {
      сведения += " · участников: " + люди.length;
      нарисовать(люди, поЛюдям, задача, сегодня);
    });
  }).catch(function (беда) {
    document.getElementById("тут").textContent = "не вышло спросить портал: " + беда.message;
    подогнать();
  });
});

// Все, кто имеет отношение к задаче. Отпуск любого из них меняет
// расчёты: исполнитель не сделает, постановщик не примет,
// соисполнитель не подхватит, наблюдатель не согласует.
function роли(задача) {
  var по_людям = {};
  function добавить(кто, роль) {
    (Array.isArray(кто) ? кто : [кто]).filter(Boolean).forEach(function (ид) {
      ид = String(ид);
      // Один человек бывает сразу в двух ролях — пишем обе,
      // но строка в панели всё равно одна.
      if (по_людям[ид]) { по_людям[ид].push(роль); } else { по_людям[ид] = [роль]; }
    });
  }
  добавить(задача.responsibleId, "исполнитель");
  добавить(задача.createdBy, "постановщик");
  добавить(задача.accomplices, "соисполнитель");
  добавить(задача.auditors, "наблюдатель");
  return по_людям;
}

function кто_нужен(задача) {
  if (!задача) return Promise.resolve([]);
  var по_ролям = роли(задача);
  var ид = Object.keys(по_ролям);
  if (!ид.length) return Promise.resolve([]);
  return зов("user.get", { ID: ид }).then(function (люди) {
    return (люди || []).map(function (ч) {
      return { ид: String(ч.ID),
               имя: [ч.LAST_NAME, ч.NAME].filter(Boolean).join(" "),
               роль: (по_ролям[String(ч.ID)] || []).join(", ") };
    });
  });
}

function нарисовать(люди, поЛюдям, задача, сегодня) {
  var куда = document.getElementById("тут");
  куда.className = "";
  var куски = [];
  var ряды = [];
  var тревога = false;
  var срок = задача ? день(задача.deadline) : null;
  if (срок) срок.setHours(0, 0, 0, 0);

  var ЦВЕТА = { вотпуске: "#c0453f", вотвот: "#d2762c", скоро: "#b8900f" };

  люди.forEach(function (ч) {
    var о = поЛюдям[ч.ид];
    if (!о) return;
    var вид = состояние(о.начало, о.конец, сегодня);
    if (!вид) return;
    // Один человек — одна строка. Две строки на каждого растили
    // панель втрое, и при троих отсутствующих нижние ушли бы
    // за край: увидеть их можно было бы только прокруткой внутри
    // блока, а туда никто не полезет.
    куски.push('<div class="строка"><span class="метка ' + вид.вид + '">' +
               ч.имя + " — " + вид.слова + "</span>");
    var замена = /Замещает:\\s*(.+)/.exec(о.описание);
    куски.push('<span class="замена">' + ч.роль +
               (замена ? " · замещает " + замена[1].trim() : "") +
               "</span></div>");
    ряды.push({ имя: ч.имя + " · " + ч.роль, начало: о.начало,
                конец: о.конец, цвет: ЦВЕТА[вид.вид] || "#8b8f95" });
    // Красная строка — только про исполнителя: срок задачи держит он.
    if (срок && срок >= о.начало && срок <= о.конец
        && ч.роль.indexOf("исполнитель") >= 0) тревога = true;
  });

  if (!куски.length) {
    // Чаще всего отсутствующих нет, и панель должна занимать
    // минимум места: одна серая строка вместо пустого блока,
    // который выглядит сломанным.
    куда.innerHTML = '<p class="тихо" style="margin:0">Все участники задачи '
      + 'на месте.</p>' + подвал();
    подогнать();
    return;
  }
  if (тревога) {
    куски.push('<div class="тревога">Срок задачи приходится на отпуск исполнителя.</div>');
  }
  // Заголовок рисует сам портал — свой был бы вторым подряд.
  куда.innerHTML = куски.join("") + гант(ряды, срок, сегодня) + подвал();
  подогнать();
}

function понедельник(д) {
  var к = new Date(д.getTime());
  // В JS неделя начинается с воскресенья, у нас — с понедельника.
  var сдвиг = (к.getDay() + 6) % 7;
  к.setDate(к.getDate() - сдвиг);
  к.setHours(0, 0, 0, 0);
  return к;
}

function гант(ряды, срок, сегодня) {
  // Шкала: от понедельника самой ранней недели до воскресенья самой
  // поздней. Края считаем по всему, что рисуем, — отпускам, сроку
  // задачи и сегодняшнему дню, иначе что-нибудь окажется за полем.
  var даты = [сегодня];
  if (срок) даты.push(срок);
  ряды.forEach(function (р) { даты.push(р.начало, р.конец); });
  var слева = понедельник(new Date(Math.min.apply(null, даты)));
  var справа = понедельник(new Date(Math.max.apply(null, даты)));
  справа.setDate(справа.getDate() + 7);

  var всего = справа - слева;
  if (всего <= 0) return "";
  function доля(д) { return ((д - слева) / всего) * 100; }

  // Недельные засечки с подписью понедельника.
  var засечки = [], подписи = [];
  for (var н = new Date(слева); н <= справа; н.setDate(н.getDate() + 7)) {
    var x = доля(н);
    засечки.push('<div class="засечка" style="left:' + x + '%"></div>');
    подписи.push('<span class="неделя" style="left:' + x + '%">' +
                 коротко(н) + "</span>");
  }
  var общие = засечки.join("") +
    '<div class="сегодня-черта" style="left:' + доля(сегодня) + '%"></div>' +
    (срок ? '<div class="срок-черта" style="left:' + доля(срок) + '%"></div>' : "");

  var куски = ['<div class="гант">',
               '<div class="шкала">' + подписи.join("") + "</div>"];
  ряды.forEach(function (р) {
    var начало = доля(р.начало);
    // Последний день отпуска — рабочий день целиком, поэтому до конца
    // суток, а не до его начала.
    var конец = доля(new Date(р.конец.getTime() + 86400000));
    куски.push('<p class="подпись-ряда">' + р.имя + "</p>");
    куски.push('<div class="полоса-ряд">' + общие +
               '<div class="отрезок" style="left:' + начало + "%;width:" +
               Math.max(1.5, конец - начало) + "%;background:" + р.цвет + '">' +
               коротко(р.начало) + "–" + коротко(р.конец) + "</div></div>");
  });
  куски.push('<p class="пояснение">' +
             '<i style="color:#2f6fb5">сегодня</i>' +
             (срок ? '<i style="color:#c0453f">срок задачи ' +
                     коротко(срок) + "</i>" : "") +
             '<i class="недели" style="color:#8b8f95">недели</i></p>');
  куски.push("</div>");
  return куски.join("");
}

function подвал() {
  var час = new Date();
  return '<p class="тихо" style="margin:8px 0 0;font-size:11px">' +
         сведения + " · " + ("0" + час.getHours()).slice(-2) + ":" +
         ("0" + час.getMinutes()).slice(-2) + "</p>";
}

function подогнать() {
  // Кадру нужно сказать его высоту, иначе портал оставляет место
  // «на всякий случай». Но и занижать нельзя: пустое содержимое
  // даёт высоту в несколько пикселей, кадр схлопывается, и блок
  // выглядит сломанным — именно так он и выглядел.
  if (!(window.BX24 && BX24.resizeWindow)) return;
  var нужно = Math.max(
    64,
    document.body.scrollHeight,
    document.documentElement ? document.documentElement.scrollHeight : 0
  ) + 16;
  BX24.resizeWindow(document.body.scrollWidth || 320, нужно);
}
</script></body></html>`;

const УСТАНОВКА = `<!doctype html><html lang="ru"><head><meta charset="utf-8">
<title>Установка</title><style>
body { font: 14px/1.6 system-ui, sans-serif; padding: 20px; color: #1b1d22; }
li { margin-bottom: 3px; } .плохо { color: #c0453f; } .хорошо { color: #2f7d4f; }
</style></head><body>
<h3>ПРОФЭНЕРДЖИ — отсутствия</h3>
<div id="итог">Занимаю место в интерфейсе…</div>
<script src="https://api.bitrix24.com/api/v1/"></script>
<script>
// Куда хотим встроиться, от нужного к запасному. Берём все места,
// которые портал признаёт: вкладка в задаче — главное, остальные
// лишними не будут.
// Место одно. Верхняя панель: она над описанием задачи, то есть
// первое, что видит открывший. Боковая колонка оказалась слишком
// низко — под файлами, связями и наблюдателями, куда не смотрят.
var ХОТИМ = [
  ["TASK_VIEW_TOP_PANEL", "Отсутствия"]
];

//: Что занимали раньше и теперь освобождаем. Список нужен: отвязать
//: можно только по имени, а портал сам лишнего не уберёт.
var ОСВОБОДИТЬ = ["TASK_VIEW_TAB", "TASK_VIEW_SIDEBAR"];

function зов(метод, доводы) {
  return new Promise(function (готово) {
    BX24.callMethod(метод, доводы || {}, function (ответ) {
      готово(ответ.error() ? { беда: ответ.error_description() || ответ.error() }
                           : { данные: ответ.data() });
    });
  });
}

BX24.init(function () {
  var адрес = location.origin + location.pathname;
  var нужное = ХОТИМ[0][0];
  var строки = [];

  // Что привязано на самом деле. Отвязка по угаданному имени
  // и адресу однажды не сработала — блок остался в боковой колонке,
  // хотя страница отчиталась об успехе. Поэтому спрашиваем портал
  // и снимаем ровно то, что он показывает.
  зов("placement.get").then(function (о) {
    var было = о.данные || [];
    строки.push("<li>привязано сейчас: " +
                (было.length
                  ? было.map(function (п) { return п.placement; }).join(", ")
                  : "ничего") + "</li>");

    var лишние = было.filter(function (п) {
      return п.placement && п.placement !== нужное;
    });

    return Promise.all(лишние.map(function (п) {
      return зов("placement.unbind", {
        PLACEMENT: п.placement, HANDLER: п.handler
      }).then(function (ответ) {
        строки.push(ответ.беда
          ? '<li class="плохо">' + п.placement + ' — не снялось: ' +
            ответ.беда + "</li>"
          : '<li class="хорошо">' + п.placement + " — снято</li>");
      });
    }));
  }).then(function () {
    return зов("placement.bind", {
      PLACEMENT: нужное, HANDLER: адрес, TITLE: ХОТИМ[0][1]
    }).then(function (ответ) {
      // «Handler already binded» значит, что место уже наше.
      // Это итог, которого мы добивались, а не сбой.
      var уже = ответ.беда && /already\\s*binded/i.test(ответ.беда);
      строки.push(ответ.беда && !уже
        ? '<li class="плохо">' + нужное + " — " + ответ.беда + "</li>"
        : '<li class="хорошо">' + нужное +
          (уже ? " — уже занято" : " — занято") + "</li>");
    });
  }).then(function () {
    // Показываем, что получилось в итоге: по этому списку видно,
    // сработало ли на самом деле, а не только по нашим словам.
    return зов("placement.get").then(function (о) {
      var стало = (о.данные || []).map(function (п) { return п.placement; });
      строки.push("<li>привязано теперь: " +
                  (стало.length ? стало.join(", ") : "ничего") + "</li>");
    });
  }).then(function () { показать(строки); });
});

function показать(строки) {
  document.getElementById("итог").innerHTML =
    "<ul>" + строки.join("") + "</ul><p>Можно закрывать.</p>";
  BX24.installFinish();
}
</script></body></html>`;

module.exports = (запрос, ответ) => {
  const поля = запрос.body || {};
  const этоУстановка =
    поля.PLACEMENT === "DEFAULT" || поля.event === "ONAPPINSTALL";

  ответ.setHeader("Content-Type", "text/html; charset=utf-8");
  // Кадр открывает портал — ему и разрешаем.
  ответ.setHeader(
    "Content-Security-Policy",
    "frame-ancestors https://*.bitrix24.ru https://*.bitrix24.com");
  ответ.setHeader("Cache-Control", "no-store");
  ответ.status(200).send(этоУстановка ? УСТАНОВКА : СТРАНИЦА);
};

