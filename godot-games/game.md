# 🎮 Godot тоглоом хийх заавар (reading_kids)

Энэ баримт нь `reading_kids` апп-д зориулж **Godot 4.7-оор тоглоом хийж, web-д export
хийгээд `/games` хэсэгт iframe-аар нэмэх** бүтэн ажлын урсгалыг тэмдэглэсэн.
Жишээ тоглоом: `godot-games/veggie-run` (やさいあつめ — Veggie Run).

---

## 0. Урьдчилан суусан зүйлс (энэ машин дээр аль хэдийн бэлэн)

| Зүйл | Байрлал / командыг |
|---|---|
| **Godot 4.7** | `/Applications/Godot.app/Contents/MacOS/Godot` (`brew install godot`) |
| **Web export templates** | `~/Library/Application Support/Godot/export_templates/4.7.stable/` |
| **Godot MCP** | `/Users/sengeedorj/workspace/godot-mcp/build/index.js` (`claude mcp add godot`) |
| **Python + PIL** | Pixel art sprite үүсгэхэд (`python3 -c "import PIL"`) |
| **PixelMplus12 font** | Япон pixel үсгийн фонт (project бүрд `fonts/`-д хуулна) |

Шинэ машин дээр суулгах бол:
```bash
brew install godot   # 4.7 суулгана
# Web templates татах (~1.2GB):
curl -sL -o templates.tpz https://github.com/godotengine/godot/releases/download/4.7-stable/Godot_v4.7-stable_export_templates.tpz
mkdir -p "$HOME/Library/Application Support/Godot/export_templates/4.7.stable"
unzip -o templates.tpz "templates/web_*" -d ext
mv ext/templates/web_* "$HOME/Library/Application Support/Godot/export_templates/4.7.stable/"
# Godot MCP:
git clone --depth 1 https://github.com/Coding-Solo/godot-mcp.git ~/workspace/godot-mcp
cd ~/workspace/godot-mcp && npm install && npm run build
claude mcp add godot -e GODOT_PATH=/Applications/Godot.app/Contents/MacOS/Godot -- node ~/workspace/godot-mcp/build/index.js
```

---

## 1. Project бүтэц

```
godot-games/<game-name>/
├── project.godot          # тохиргоо (viewport хэмжээ, input map, gl_compatibility)
├── export_presets.cfg     # Web export preset (доор чухал талбарууд)
├── main.tscn              # Main scene (main.gd-г ext_resource-оор ачаална)
├── main.gd               # Бүх тоглоомын логик (Node2D)
├── art/                  # pixel PNG sprite-ууд (+ Godot-ийн .import файлууд)
└── fonts/PixelMplus12-Bold.ttf   # япон үсэг
```

Export-ийн гаралт → **`public/godot/<game-name>/`** (Next.js статик serve хийдэг).

---

## 2. Чухал тохиргоонууд

### project.godot
- `window/size/viewport_width=640`, `height=360` (16:9 бага дэлгэц)
- `window/stretch/mode="canvas_items"`, `aspect="keep"`
- `renderer/rendering_method="gl_compatibility"` — WebGL 2.0-д тохирно
- `textures/canvas_textures/default_texture_filter=0` — pixel art (nearest, бүдгэрэхгүй)
- Input map: `move_left/right/up/down` → WASD + сум товч

### export_presets.cfg (iframe-д ажиллахад ЧУХАЛ)
```ini
export_path="../../public/godot/<game-name>/index.html"
[preset.0.options]
variant/thread_support=false          # ← COOP/COEP header шаардлагагүй болгоно
html/canvas_resize_policy=2           # canvas-г контейнерт тааруулна
progressive_web_app/enabled=false
```
> **`thread_support=false` заавал.** Threads асаалттай бол browser-т
> `Cross-Origin-Opener-Policy` / `Cross-Origin-Embedder-Policy` header хэрэгтэй
> болж, дотоод sandbox-гүй iframe-д ажиллахгүй. Threads-гүй бол same-origin
> iframe-д шууд ажиллана.

---

## 3. Дахин ашиглагддаг GDScript загварууд

### Web Speech API (япон дуудлага)
```gdscript
func _speak(text: String) -> void:
    if OS.has_feature("web"):
        var js := "var u=new SpeechSynthesisUtterance('%s');u.lang='ja-JP';u.rate=0.9;u.pitch=1.1;speechSynthesis.cancel();speechSynthesis.speak(u);" % text
        JavaScriptBridge.eval(js)
```
Апп-ын бусад хэсэгтэй ижил TTS дуу гаргана. (`OS.has_feature("web")` тул editor-т алдаа заахгүй.)

### Tap/click хийсэн газар руу алхах (хүүхдэд ээлтэй, keyboard-гүй)
```gdscript
func _physics_process(_d):
    var dir := Input.get_vector("move_left","move_right","move_up","move_down")
    if dir != Vector2.ZERO: pointer_active = false          # keyboard давамгайлна
    elif pointer_active:
        var to := pointer_target - player.position
        dir = to.normalized() if to.length() > 6.0 else Vector2.ZERO
    player.velocity = dir * SPEED
    player.move_and_slide()

func _unhandled_input(e):
    if (e is InputEventScreenTouch and e.pressed) or (e is InputEventMouseButton and e.pressed):
        pointer_active = true; pointer_target = _to_world(e.position)

func _to_world(p): return get_canvas_transform().affine_inverse() * p
```
> Дэлгэцийн координатыг **дэлхийн координат** руу `get_canvas_transform()`-оор хөрвүүлэх
> ёстой (stretch mode-той үед scale/offset өөрчлөгддөг).

### Япон фонт бүх Label / Button-д
```gdscript
var jp_font := load("res://fonts/PixelMplus12-Bold.ttf")
func _style(l): l.add_theme_font_override("font", jp_font); l.add_theme_constant_override("outline_size", 6)
```
> Godot-ийн default фонт кана дэмжихгүй тул заавал фонт override хийнэ.
> Emoji GDScript Label-д гарахгүй — текстээр бич (「🥕」биш「やさい:」).

---

## 4. Pixel art sprite (Python + PIL)

Aseprite биш, **Python-оор** дүрсийг grid string-ээр зурж болно (хурдан,
итерацлахад амар). Жишээ загвар `scratchpad/make_sprites.py`-д:
```python
def sprite(name, grid, palette, scale=2):
    img = Image.new("RGBA", (16, 16), (0,0,0,0)); px = img.load()
    for y,row in enumerate(grid):
        for x,ch in enumerate(row):
            if ch != ".": px[x,y] = palette[ch]
    img.resize((32,32), Image.NEAREST).save(f"{OUT}/{name}.png")
```
16×16 grid → ×2 nearest scale = 32×32. Зүлэг/шороо tile-д санамсаргүй noise нэмнэ.

---

## 5. Build & export командууд

```bash
cd godot-games/<game-name>

# 1) Ресурс import (шинэ art нэмсэн бол эхлээд):
/Applications/Godot.app/Contents/MacOS/Godot --headless --import .

# 2) Web export:
/Applications/Godot.app/Contents/MacOS/Godot --headless --export-release "Web"
# → public/godot/<game-name>/index.{html,js,wasm,pck,png} үүснэ (~38MB wasm)
```

### Headless тест (өөрчлөлт ажиллаж байгаа эсэхийг шалгах)
`SceneTree`-ээс өвлөсөн `test_flow.gd` бичээд логикыг browser-гүйгээр шалгана:
```bash
/Applications/Godot.app/Contents/MacOS/Godot --headless --path . -s test_flow.gd
```
`veggie-run/test_flow.gd`-г жишээ болгон ав (дүр сонголт → level дуусгах → шилжилт).

### Browser preview
`/games/[id]` тоглоомын tab hidden үед timer/rAF throttle болдог тул
Browser pane дээр "зогссон" мэт харагдаж болно — жинхэнэ нээлттэй tab-д хэвийн.

---

## 6. `/games` жагсаалтад нэмэх

Export дууссаны дараа `/admin/games` дээр шинэ тоглоом нэмнэ:
- **iframe src**: `/godot/<game-name>/index.html` (same-origin — sandbox автоматаар авагдана)
- Emoji, banner зураг, tags тохируулна

> `/games/[id]` дотоод (өөрийн домэйн) тоглоомд sandbox хийдэггүй тул TTS дуу
> ажиллана (гадны Higgsfield зэрэг л sandbox-той).

---

## 7. Git

- Source: `godot-games/<game-name>/` (art, gd, tscn, .import — бүгд commit хийнэ)
- Build: `public/godot/<game-name>/` (~38MB wasm-тай хамт)
- `.gitignore`-д `godot-games/*/.godot/` (import cache) орсон
- Push хийхээс өмнө хэрэглэгч зөвшөөрөх (заавал "push" гэж хэлэхэд)

---

## Жишээ: Veggie Run-ий онцлогууд (лавлагаа)

- Дүр сонголт (くま/うさぎ/ぱんだ/きつね) — дарахад япон нэрээ хэлнэ
- Ногоо/жимс бүрээс 4-ийг цуглуулах зорилго, per-kind progress HUD
- 3 level: やさいばたけ (ногоо) → くだものえん (жимс) → ようがんどうくつ (лаав, холимог)
- Бүх зүйлийг цуглуулмагц дараагийн level / ぜんぶクリア！
- Зомби: ирмэгээс гарч ирээд хөөнө (level ахих тусам олон, хурдан); сум (X/Z
  эсвэл うつ товч)-аар буудаж унагана
- 3 зүрх (баруун дээд HUD): зомбид баригдах / лаав дээр буух бүрд -1,
  1.5s invincible анивчина; 0 болбол ゲームオーバー → もういちど
- Level 3-ын лаав tile дээр алхаж болохгүй (хана шиг хаагдана) — ジャンプ-аар
  дээгүүр нь харайна; лаав дээр буувал зүрх алдаж сүүлийн аюулгүй цэг рүү буцна
- Roblox-маяг дугуй touch товчнууд баруун доод буланд: うつ (буудах),
  ジャンプ (харайх); keyboard: X/Z = буудах, Space = харайх
- Roblox-маяг ДИНАМИК joystick: зүүн талын хагаст хуруу тавьсан газар суурь нь
  очиж идэвхжинэ; хуруугаа авмагц дүр ШУУД зогсоно (tap-to-move устгасан).
  Давуу эрэмбэ: keyboard > joystick
- **Multi-touch ЧУХАЛ**: Godot GUI Button зөвхөн ЭХНИЙ хүрэлтэд (mouse
  emulation) хариу үзүүлдэг тул утсан дээр хоёр гараар тоглоход (joystick
  барьсан хуруу + үйлдлийн хуруу) Button ажиллахгүй. Шийдэл: бүх in-game
  товч (うつ/ジャンプ) болон select дэлгэцийн товчнуудыг `_unhandled_input`
  дотор гараар hit-test хийдэг (`_pointer_press`, `_overlay_touch`).
  Touch-emulated mouse давхардлыг `event.device == DEVICE_ID_EMULATION`
  шалгалтаар хаасан; handler-ууд idempotent (давхар очиход хор нөлөөгүй)
- Portrait утсан дээр「スマホを よこむきに してね！」overlay гарч тоглоом
  түр зогсоно; start дарахад `screen.orientation.lock('landscape')` оролдоно
  (PWA/fullscreen орчинд ажиллана, бусад үед чимээгүй алгасна)
- Headless test (`test_flow.gd`): auto-spawn, буудлага, зүрх, лаав буулт,
  3 level-ийн flow, game over — бүгдийг browser-гүй шалгана
