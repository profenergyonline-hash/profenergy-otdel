/**
 * ���������� ���������� ������������ � ����������� ��� Vercel.
 * ������ �� ������.html � ������� ��������, � �� ���� ����.
 *
 * ������� �� ������, � ������� ��� �� �����, ������ � �����������
 * �� ������: �������� �������� � ����� ������� � ���������� ��
 * � ������ �������� �� ����� ����, ��� �������. ������� ������
 * �� ������ �� ����� �������.
 */
const �������� = `<!doctype html><html lang="ru"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>����������</title>
<style>
  :root { color-scheme: light dark; }
  body { font: 13.5px/1.5 "Helvetica Neue", Arial, system-ui, sans-serif;
         margin: 0; padding: 12px; color: #1b1d22; background: #fff; }
  @media (prefers-color-scheme: dark) { body { color: #e8e6e1; background: #1f2126; } }
  .������ { display: flex; gap: 8px; align-items: baseline; margin-bottom: 6px; flex-wrap: wrap; }
  .����� { display: inline-flex; align-items: center; gap: 5px; font-weight: 600;
           font-size: 12px; padding: 2px 9px; border-radius: 11px; white-space: nowrap; }
  .�����::before { content: ""; width: 7px; height: 7px; border-radius: 50%; background: currentColor; }
  .�������� { color: #c0453f; background: rgba(192,69,63,.14); }
  .������  { color: #d2762c; background: rgba(210,118,44,.14); }
  .�����   { color: #b8900f; background: rgba(214,165,22,.16); }
  .������ { color: #6b6f75; font-size: 12.5px; }
  .���� { color: #6b6f75; }
  .������� { margin-top: 10px; padding: 9px 11px; border-left: 3px solid #c0453f;
             background: rgba(192,69,63,.09); border-radius: 0 5px 5px 0; }

  /* ����: ����� ������ � �������� �� ����� �����. ��������� ������� �
     ����� ���������� �������� ������, � �� ���������� � ���. */
  .���� { margin: 12px 0 2px; }
  .����� { position: relative; height: 15px; margin-bottom: 3px; }
  .������ { position: absolute; top: 0; font-size: 10px; color: #8b8f95;
            transform: translateX(-50%); white-space: nowrap; }
  .������-��� { position: relative; height: 20px; margin-bottom: 9px;
                background: rgba(127,127,127,.10); border-radius: 4px; }
  .������� { position: absolute; top: 0; bottom: 0; width: 1px;
             background: rgba(127,127,127,.22); }
  .������� { position: absolute; top: 3px; height: 14px; border-radius: 3px;
             display: flex; align-items: center; padding: 0 5px;
             font-size: 10px; color: #fff; white-space: nowrap; overflow: hidden; }
  /* ����� ������������ ��� � ����� ������. ���� � ��� ������� �
     �� ���� ����� �� ����� �� ���� �����, � ����� �� �����������.
     ������ �����, ������ ����� � � ������� ������: ������ ��������
     ���� ���, ��� ����� �������� �� �������� �������. */
  .�������-�����, .����-����� {
    position: absolute; top: -4px; bottom: -4px; width: 3px;
    border-radius: 2px; z-index: 2; margin-left: -1px;
    box-shadow: 0 0 0 1px rgba(255,255,255,.75);
  }
  .�������-�����::after, .����-�����::after {
    content: ""; position: absolute; left: 50%; top: -3px;
    width: 9px; height: 9px; border-radius: 50%;
    transform: translateX(-50%); background: inherit;
    box-shadow: 0 0 0 1.5px rgba(255,255,255,.85);
  }
  .�������-����� { background: #2f6fb5; }
  .����-����� { background: #c0453f; }
  .�������-���� { font-size: 11px; color: #6b6f75; margin: 0 0 2px; }
  .��������� { font-size: 10.5px; color: #8b8f95; margin: 4px 0 0;
               display: flex; gap: 10px; flex-wrap: wrap; }
  .��������� i { font-style: normal; display: inline-flex; align-items: center; gap: 4px; }
  .��������� i::before { content: ""; width: 9px; height: 9px; border-radius: 50%;
                         background: currentColor; }
  .��������� i.������::before { width: 9px; height: 3px; border-radius: 2px; }
  h2 { font-size: 12px; text-transform: uppercase; letter-spacing: .06em;
       color: #6b6f75; margin: 0 0 8px; font-weight: 600; }
</style></head><body>
<div id="���" class="����">�������</div>
<script src="https://api.bitrix24.com/api/v1/"></script>
<script>
// ������ ���� � �������: �� ���� ������� �� �������� �������.
// ������� ����� ��������� � ��������� �������� � �� ���� �����
// ��� ���, � � �������� ������� ����� ������������� ����������.
var ������� = /��:\\s*(\\d+)/;
//: ��� ������ ������ ��������. ���������� ����� ������ ����� �
//: ��� ������������ ������ �������� ������ �� � �������
//: �� ������� �� ������������.
var �������� = "";
// �������� 14 ������ 7: �� ������ ���������. ������� 7.
var ����������_�� = 14;

function ���(�����, ������) {
  return new Promise(function (������, ����) {
    BX24.callMethod(�����, ������ || {}, function (�����) {
      if (�����.error()) {
        ����(new Error(�����.error_description() || �����.error()));
      } else {
        ������(�����.data());
      }
    });
  });
}

function ����(������) {
  if (!������) return null;
  // ������ ����� ���� ���� ��� �2026-10-15�, ���� ���
  // �15.10.2026 00:00:00� � ������� �� �������� �������. ������ ���
  // ������� ��� �� ���������, ������� ��������� ������.
  var ������� = /^(\\d{2})\\.(\\d{2})\\.(\\d{4})/.exec(������);
  var � = �������
    ? new Date(+�������[3], +�������[2] - 1, +�������[1])
    : new Date(������);
  return isNaN(�) ? null : �;
}

function �������(�) {
  return ("0" + �.getDate()).slice(-2) + "." + ("0" + (�.getMonth() + 1)).slice(-2);
}

function ���������(�, ��, �������) {
  if (������� > ��) return null;
  var �������� = Math.round((� - �������) / 86400000);
  if (������� >= �) return { ���: "��������", �����: "� ������� �� " + �������(��) };
  if (�������� > ����������_��) return null;
  if (�������� > 2) return { ���: "�����", �����: "������ " + �������(�) + "�" + �������(��) };
  var ����� = �������� === 1 ? "������" : �������� === 0 ? "�������" : "����� " + �������� + " ��.";
  return { ���: "������", �����: "������ " + ����� + " � �� " + �������(��) };
}

// ���� ������ ������-�� �� �������, ������ �� ������ ��������
// �����: �������� ���� ������� ������ ��� ������� � ��������
// ��� ������, ���� ����� ��� ��������.
setTimeout(function () {
  var ��� = document.getElementById("���");
  if (��� && /^������/.test(���.textContent || "")) {
    ���.textContent = "������ �� �������. �������� �������� ������.";
    ���������();
  }
}, 8000);

BX24.init(function () {
  var ��������� = (BX24.placement && BX24.placement.info()) || {};
  var ���� = ���������.options || {};
  var �������� = ����.taskId || ����.ID || ����.id;
  var ������� = new Date(); �������.setHours(0, 0, 0, 0);
  var ������� = new Date(�������.getTime() + 180 * 86400000);

  Promise.all([
    �������� ? ���("tasks.task.get", { taskId: ��������,
        select: ["ID", "TITLE", "RESPONSIBLE_ID", "CREATED_BY",
                 "ACCOMPLICES", "AUDITORS", "DEADLINE"] }) : null,
    ���("calendar.event.get", { type: "company_calendar", ownerId: 0,
        from: �������.toISOString().slice(0, 10), to: �������.toISOString().slice(0, 10) })
  ]).then(function (����) {
    var ������ = ����[0] && ����[0].task ? ����[0].task : null;
    var ������� = ����[1] || [];

    var ������� = {};
    �������.forEach(function (�) {
      var ����� = �������.exec(�.DESCRIPTION || "");
      if (!�����) return;
      var ������ = ����(�.DATE_FROM), ����� = ����(�.DATE_TO);
      if (!������ || !�����) return;
      ������.setHours(0, 0, 0, 0); �����.setHours(0, 0, 0, 0);
      �������[�����[1]] = { ������: ������, �����: �����, ��������: �.DESCRIPTION || "" };
    });

    // ������ ���������: �� ��� �����, ��� ������ ���� � ��� ������
    // ��� �������. �������� ���� ��������� �� ����������, � ���
    // ������ ������ ���� �� ��, ����� ��� ������.
    �������� = "������ " + (�������� || "�� ��������") +
               " � �������� � ���������: " + Object.keys(�������).length;

    ���_�����(������).then(function (����) {
      �������� += " � ����������: " + ����.length;
      ����������(����, �������, ������, �������);
    });
  }).catch(function (����) {
    document.getElementById("���").textContent = "�� ����� �������� ������: " + ����.message;
    ���������();
  });
});

// ���, ��� ����� ��������� � ������. ������ ������ �� ��� ������
// �������: ����������� �� �������, ����������� �� ������,
// ������������� �� ���������, ����������� �� ���������.
function ����(������) {
  var ��_����� = {};
  function ��������(���, ����) {
    (Array.isArray(���) ? ��� : [���]).filter(Boolean).forEach(function (��) {
      �� = String(��);
      // ���� ������� ������ ����� � ���� ����� � ����� ���,
      // �� ������ � ������ �� ����� ����.
      if (��_�����[��]) { ��_�����[��].push(����); } else { ��_�����[��] = [����]; }
    });
  }
  ��������(������.responsibleId, "�����������");
  ��������(������.createdBy, "�����������");
  ��������(������.accomplices, "�������������");
  ��������(������.auditors, "�����������");
  return ��_�����;
}

function ���_�����(������) {
  if (!������) return Promise.resolve([]);
  var ��_����� = ����(������);
  var �� = Object.keys(��_�����);
  if (!��.length) return Promise.resolve([]);
  return ���("user.get", { ID: �� }).then(function (����) {
    return (���� || []).map(function (�) {
      return { ��: String(�.ID),
               ���: [�.LAST_NAME, �.NAME].filter(Boolean).join(" "),
               ����: (��_�����[String(�.ID)] || []).join(", ") };
    });
  });
}

function ����������(����, �������, ������, �������) {
  var ���� = document.getElementById("���");
  ����.className = "";
  var ����� = [];
  var ���� = [];
  var ������� = false;
  var ���� = ������ ? ����(������.deadline) : null;
  if (����) ����.setHours(0, 0, 0, 0);

  var ����� = { ��������: "#c0453f", ������: "#d2762c", �����: "#b8900f" };

  ����.forEach(function (�) {
    var � = �������[�.��];
    if (!�) return;
    var ��� = ���������(�.������, �.�����, �������);
    if (!���) return;
    // ���� ������� � ���� ������. ��� ������ �� ������� �������
    // ������ �����, � ��� ����� ������������� ������ ���� ��
    // �� ����: ������� �� ����� ���� �� ������ ���������� ������
    // �����, � ���� ����� �� �������.
    �����.push('<div class="������"><span class="����� ' + ���.��� + '">' +
               �.��� + " � " + ���.����� + "</span>");
    var ������ = /��������:\\s*(.+)/.exec(�.��������);
    �����.push('<span class="������">' + �.���� +
               (������ ? " � �������� " + ������[1].trim() : "") +
               "</span></div>");
    ����.push({ ���: �.��� + " � " + �.����, ������: �.������,
                �����: �.�����, ����: �����[���.���] || "#8b8f95" });
    // ������� ������ � ������ ��� �����������: ���� ������ ������ ��.
    if (���� && ���� >= �.������ && ���� <= �.�����
        && �.����.indexOf("�����������") >= 0) ������� = true;
  });

  if (!�����.length) {
    // ���� ����� ������������� ���, � ������ ������ ��������
    // ������� �����: ���� ����� ������ ������ ������� �����,
    // ������� �������� ���������.
    ����.innerHTML = '<p class="����" style="margin:0">��� ��������� ������ '
      + '�� �����.</p>' + ������();
    ���������();
    return;
  }
  if (�������) {
    �����.push('<div class="�������">���� ������ ���������� �� ������ �����������.</div>');
  }
  // ��������� ������ ��� ������ � ���� ��� �� ������ ������.
  ����.innerHTML = �����.join("") + ����(����, ����, �������) + ������();
  ���������();
}

function �����������(�) {
  var � = new Date(�.getTime());
  // � JS ������ ���������� � �����������, � ��� � � ������������.
  var ����� = (�.getDay() + 6) % 7;
  �.setDate(�.getDate() - �����);
  �.setHours(0, 0, 0, 0);
  return �;
}

function ����(����, ����, �������) {
  // �����: �� ������������ ����� ������ ������ �� ����������� �����
  // �������. ���� ������� �� �����, ��� ������, � ��������, �����
  // ������ � ������������ ���, ����� ���-������ �������� �� �����.
  var ���� = [�������];
  if (����) ����.push(����);
  ����.forEach(function (�) { ����.push(�.������, �.�����); });
  var ����� = �����������(new Date(Math.min.apply(null, ����)));
  var ������ = �����������(new Date(Math.max.apply(null, ����)));
  ������.setDate(������.getDate() + 7);

  var ����� = ������ - �����;
  if (����� <= 0) return "";
  function ����(�) { return ((� - �����) / �����) * 100; }

  // ��������� ������� � �������� ������������.
  var ������� = [], ������� = [];
  for (var � = new Date(�����); � <= ������; �.setDate(�.getDate() + 7)) {
    var x = ����(�);
    �������.push('<div class="�������" style="left:' + x + '%"></div>');
    �������.push('<span class="������" style="left:' + x + '%">' +
                 �������(�) + "</span>");
  }
  var ����� = �������.join("") +
    '<div class="�������-�����" style="left:' + ����(�������) + '%"></div>' +
    (���� ? '<div class="����-�����" style="left:' + ����(����) + '%"></div>' : "");

  var ����� = ['<div class="����">',
               '<div class="�����">' + �������.join("") + "</div>"];
  ����.forEach(function (�) {
    var ������ = ����(�.������);
    // ��������� ���� ������� � ������� ���� �������, ������� �� �����
    // �����, � �� �� ��� ������.
    var ����� = ����(new Date(�.�����.getTime() + 86400000));
    �����.push('<p class="�������-����">' + �.��� + "</p>");
    �����.push('<div class="������-���">' + ����� +
               '<div class="�������" style="left:' + ������ + "%;width:" +
               Math.max(1.5, ����� - ������) + "%;background:" + �.���� + '">' +
               �������(�.������) + "�" + �������(�.�����) + "</div></div>");
  });
  �����.push('<p class="���������">' +
             '<i style="color:#2f6fb5">�������</i>' +
             (���� ? '<i style="color:#c0453f">���� ������ ' +
                     �������(����) + "</i>" : "") +
             '<i class="������" style="color:#8b8f95">������</i></p>');
  �����.push("</div>");
  return �����.join("");
}

function ������() {
  var ��� = new Date();
  return '<p class="����" style="margin:8px 0 0;font-size:11px">' +
         �������� + " � " + ("0" + ���.getHours()).slice(-2) + ":" +
         ("0" + ���.getMinutes()).slice(-2) + "</p>";
}

function ���������() {
  // ����� ����� ������� ��� ������, ����� ������ ��������� �����
  // ��� ������ ������. �� � �������� ������: ������ ����������
  // ��� ������ � ��������� ��������, ���� ������������, � ����
  // �������� ��������� � ������ ��� �� � ��������.
  if (!(window.BX24 && BX24.resizeWindow)) return;
  var ����� = Math.max(
    64,
    document.body.scrollHeight,
    document.documentElement ? document.documentElement.scrollHeight : 0
  ) + 16;
  BX24.resizeWindow(document.body.scrollWidth || 320, �����);
}
</script></body></html>`;

const ��������� = `<!doctype html><html lang="ru"><head><meta charset="utf-8">
<title>���������</title><style>
body { font: 14px/1.6 system-ui, sans-serif; padding: 20px; color: #1b1d22; }
li { margin-bottom: 3px; } .����� { color: #c0453f; } .������ { color: #2f7d4f; }
</style></head><body>
<h3>����������� � ����������</h3>
<div id="����">������� ����� � ����������</div>
<script src="https://api.bitrix24.com/api/v1/"></script>
<script>
// ���� ����� ����������, �� ������� � ���������. ���� ��� �����,
// ������� ������ �������: ������� � ������ � �������, ���������
// ������� �� �����.
// ����� ����. ������� ������: ��� ��� ��������� ������, �� ����
// ������, ��� ����� ���������. ������� ������� ��������� �������
// ����� � ��� �������, ������� � �������������, ���� �� �������.
var ����� = [
  ["TASK_VIEW_TOP_PANEL", "����������"]
];

//: ��� �������� ������ � ������ �����������. ������ �����: ��������
//: ����� ������ �� �����, � ������ ��� ������� �� �����.
var ���������� = ["TASK_VIEW_TAB", "TASK_VIEW_SIDEBAR"];

function ���(�����, ������) {
  return new Promise(function (������) {
    BX24.callMethod(�����, ������ || {}, function (�����) {
      ������(�����.error() ? { ����: �����.error_description() || �����.error() }
                           : { ������: �����.data() });
    });
  });
}

BX24.init(function () {
  var ����� = location.origin + location.pathname;
  var ������ = �����[0][0];
  var ������ = [];

  // ��� ��������� �� ����� ����. ������� �� ���������� �����
  // � ������ ������� �� ��������� � ���� ������� � ������� �������,
  // ���� �������� ���������� �� ������. ������� ���������� ������
  // � ������� ����� ��, ��� �� ����������.
  ���("placement.get").then(function (�) {
    var ���� = �.������ || [];
    ������.push("<li>��������� ������: " +
                (����.length
                  ? ����.map(function (�) { return �.placement; }).join(", ")
                  : "������") + "</li>");

    var ������ = ����.filter(function (�) {
      return �.placement && �.placement !== ������;
    });

    return Promise.all(������.map(function (�) {
      return ���("placement.unbind", {
        PLACEMENT: �.placement, HANDLER: �.handler
      }).then(function (�����) {
        ������.push(�����.����
          ? '<li class="�����">' + �.placement + ' � �� �������: ' +
            �����.���� + "</li>"
          : '<li class="������">' + �.placement + " � �����</li>");
      });
    }));
  }).then(function () {
    return ���("placement.bind", {
      PLACEMENT: ������, HANDLER: �����, TITLE: �����[0][1]
    }).then(function (�����) {
      // �Handler already binded� ������, ��� ����� ��� ����.
      // ��� ����, �������� �� ����������, � �� ����.
      var ��� = �����.���� && /already\\s*binded/i.test(�����.����);
      ������.push(�����.���� && !���
        ? '<li class="�����">' + ������ + " � " + �����.���� + "</li>"
        : '<li class="������">' + ������ +
          (��� ? " � ��� ������" : " � ������") + "</li>");
    });
  }).then(function () {
    // ����������, ��� ���������� � �����: �� ����� ������ �����,
    // ��������� �� �� ����� ����, � �� ������ �� ����� ������.
    return ���("placement.get").then(function (�) {
      var ����� = (�.������ || []).map(function (�) { return �.placement; });
      ������.push("<li>��������� ������: " +
                  (�����.length ? �����.join(", ") : "������") + "</li>");
    });
  }).then(function () { ��������(������); });
});

function ��������(������) {
  document.getElementById("����").innerHTML =
    "<ul>" + ������.join("") + "</ul><p>����� ���������.</p>";
  BX24.installFinish();
}
</script></body></html>`;

module.exports = (������, �����) => {
  const ���� = ������.body || {};
  const ������������ =
    ����.PLACEMENT === "DEFAULT" || ����.event === "ONAPPINSTALL";

  �����.setHeader("Content-Type", "text/html; charset=utf-8");
  // ���� ��������� ������ � ��� � ���������.
  �����.setHeader(
    "Content-Security-Policy",
    "frame-ancestors https://*.bitrix24.ru https://*.bitrix24.com");
  �����.setHeader("Cache-Control", "no-store");
  �����.status(200).send(������������ ? ��������� : ��������);
};

