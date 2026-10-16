"""Vendoriza os ícones Solar (linear) usados pelo Prisma a partir da API do Iconify.

Uso:  python3 scripts/vendor-icons.py /tmp/icons.json
Depois, regere assets/js/icons.js a partir do JSON (o mapa nome-do-prisma -> nome-solar está em MAP).
"sidebar", "stop" e "crystal-plus" são desenhos próprios e "wand" vem do próprio DS
(assets/icons/solar/magic-stick-3-linear.svg). Precisa de internet só ao rodar; o app não chama a API.
"""
import json, urllib.request, sys
MAP = {
 "chat":"chat-round-line-linear","new-chat":"pen-new-square-linear","plus":"add-linear","x":"close-linear","check":"check-linear",
 "folder":"folder-linear","folder-plus":"add-folder-linear","folder-open":"folder-open-linear","skill":"bolt-linear","agent":"user-speak-rounded-linear",
 "gallery":"widget-linear","shield":"shield-user-linear","course":"square-academic-cap-linear","notebook":"notebook-linear",
 "external":"arrow-right-up-linear","settings":"settings-linear","chevron-right":"alt-arrow-right-linear","chevron-left":"alt-arrow-left-linear",
 "chevron-down":"alt-arrow-down-linear","chevron-up":"alt-arrow-up-linear","chevron-up-down":"sort-vertical-linear","more":"menu-dots-linear",
 "menu":"hamburger-menu-linear","search":"magnifier-linear","upload":"upload-minimalistic-linear",
 "paperclip":"paperclip-linear","file":"file-text-linear","image":"gallery-wide-linear","check-circle":"check-circle-linear",
 "arrow-up":"arrow-up-linear","arrow-down":"arrow-down-linear","arrow-right":"arrow-right-linear","arrow-left":"arrow-left-linear","copy":"copy-linear",
 "thumb-up":"like-linear","thumb-down":"dislike-linear","refresh":"refresh-linear","pencil":"pen-2-linear","trash":"trash-bin-minimalistic-linear",
 "download":"download-minimalistic-linear","link":"link-linear","heart":"heart-linear","heart-fill":"heart-bold","star":"star-linear","star-fill":"star-bold",
 "info":"info-circle-linear","alert":"danger-triangle-linear","lock":"lock-keyhole-minimalistic-linear","clock":"clock-circle-linear",
 "calendar":"calendar-linear","cpu":"cpu-bolt-linear","chart":"chart-square-linear","users":"users-group-rounded-linear","logout":"logout-2-linear",
 "sparkles":"stars-minimalistic-linear","bookmark":"bookmark-linear","database":"database-linear",
 "workflow":"routing-2-linear","eye":"eye-linear","eye-off":"eye-closed-linear","filter":"filter-linear","command":"command-linear",
 "keyboard":"keyboard-linear","home":"home-smile-angle-linear","history":"history-linear","share":"share-linear","globe":"global-linear",
 "tune":"tuning-2-linear","user":"user-circle-linear","help":"question-circle-linear","verified":"verified-check-bold","pin":"pin-linear",
 "code":"code-square-linear","money":"dollar-minimalistic-linear","bulb":"lightbulb-minimalistic-linear","ban":"forbidden-circle-linear",
 "wallet":"wallet-money-linear","list":"list-linear","grid":"widget-4-linear","layers":"layers-minimalistic-linear","inbox":"inbox-linear",
 "send":"plain-linear","tag":"tag-linear","danger":"danger-circle-linear","wifi-off":"wi-fi-router-minimalistic-linear","cloud-off":"cloud-cross-linear",
 "dot":"record-linear","mail":"letter-linear","bell":"bell-linear","stopwatch":"stopwatch-linear","graph":"graph-up-linear",
}
names = sorted(set(MAP.values()))
url = "https://api.iconify.design/solar.json?icons=" + ",".join(names)
data = json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 prisma-vendor"}), timeout=20))
icons = data.get("icons", {})
missing = [n for n in names if n not in icons]
print("missing:", missing, file=sys.stderr)
out = {}
for k, v in MAP.items():
    if v in icons:
        out[k] = icons[v]["body"]
json.dump({"map": MAP, "body": out, "missing": missing}, open(sys.argv[1], "w"))
print(len(out), "icons", file=sys.stderr)
