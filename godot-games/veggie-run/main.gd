extends Node2D
# ── Veggie Run 「やさいあつめ」──────────────────────────────────────────────
# Pick a character, then collect 4 of every vegetable to clear level 1.
# Level 2 is an orchard with fruits, level 3 is a lava cave with mixed items.
# Zombies chase the player — shoot them (うつ button / X・Z key) or dodge by
# jumping (ジャンプ button / Space). 3 hearts; caught 3 times = game over.
# In the lava cave, lava tiles block walking — jump across them; landing on
# lava costs a heart. Every pickup speaks the item's Japanese name.

const TILE := 32
const COLS := 20
const ROWS := 12
const SPEED := 150.0
const NEED := 4  # how many of each kind to collect
const MAX_HEARTS := 3
const BULLET_SPEED := 320.0
const SHOOT_CD := 0.25
const JUMP_TIME := 0.5
const JUMP_BOOST := 1.8
const ZOMBIE_SPAWN_EVERY := 2.5
const ZOMBIE_MAX := [2, 3, 4]  # per level
const JOY_CENTER := Vector2(72, 302)  # movement joystick, bottom-left
const JOY_R := 42.0
const JOY_KNOB_R := 18.0
const JOY_NONE := -99
const MOUSE_ID := -50

const CHARACTERS := [
	{"tex": "bear",   "jp": "くま"},
	{"tex": "rabbit", "jp": "うさぎ"},
	{"tex": "panda",  "jp": "ぱんだ"},
	{"tex": "fox",    "jp": "きつね"},
]

const VEGGIES := [
	{"tex": "carrot",     "jp": "にんじん",     "romaji": "ninjin"},
	{"tex": "tomato",     "jp": "とまと",       "romaji": "tomato"},
	{"tex": "eggplant",   "jp": "なす",         "romaji": "nasu"},
	{"tex": "corn",       "jp": "とうもろこし", "romaji": "toumorokoshi"},
	{"tex": "pumpkin",    "jp": "かぼちゃ",     "romaji": "kabocha"},
]

const FRUITS := [
	{"tex": "apple",      "jp": "りんご",   "romaji": "ringo"},
	{"tex": "banana",     "jp": "ばなな",   "romaji": "banana"},
	{"tex": "grapes",     "jp": "ぶどう",   "romaji": "budou"},
	{"tex": "orange",     "jp": "みかん",   "romaji": "mikan"},
	{"tex": "strawberry", "jp": "いちご",   "romaji": "ichigo"},
]

const MIXED := [
	{"tex": "carrot",     "jp": "にんじん", "romaji": "ninjin"},
	{"tex": "corn",       "jp": "とうもろこし", "romaji": "toumorokoshi"},
	{"tex": "apple",      "jp": "りんご",   "romaji": "ringo"},
	{"tex": "grapes",     "jp": "ぶどう",   "romaji": "budou"},
	{"tex": "strawberry", "jp": "いちご",   "romaji": "ichigo"},
]

const LEVELS := [
	{"name": "やさい ばたけ", "ground": ["grass0", "grass1"],     "items": VEGGIES},
	{"name": "くだもの えん", "ground": ["orchard0", "orchard1"], "items": FRUITS},
	{"name": "ようがん どうくつ", "ground": ["rock0", "rock1"],   "items": MIXED, "lava": true},
]

# 20×12 map for the lava level: L = lava (blocked unless jumping)
const LAVA_MAP := [
	"....................",
	"..LL.......LLL......",
	"..LLL......LLLL.....",
	"...LL.......LL......",
	"....................",
	".......LL...........",
	"......LLLL.....LL...",
	"......LLLL.....LLL..",
	".......LL.......L...",
	"..LL................",
	"..LLL......LLL......",
	"....................",
]

# ── Web touch: compute design-space (640×360) coords ourselves ────────────────
# Godot Web mis-scales InputEventScreenTouch on HiDPI screens (devicePixelRatio
# > 1) — the very phones this game targets — while mouse events stay correct.
# So on web we ignore Godot's touch events and instead listen to the canvas'
# raw browser touches, converting with getBoundingClientRect() (CSS pixels, so
# dpr-independent) into the aspect-kept 640×360 design space. Coordinates then
# match every Control/button position exactly, on any device.
const JS_INSTALL := """
(function(){
  if(window.__vr && window.__vr.installed) return;
  var c = document.querySelector('canvas');
  if(!c) return;
  window.__vr = {installed:true, queue:[]};
  function toDesign(cx, cy){
    var r = c.getBoundingClientRect();
    var s = Math.min(r.width/640.0, r.height/360.0);
    if(s <= 0) s = 1;
    var ox = (r.width  - 640.0*s)/2.0;
    var oy = (r.height - 360.0*s)/2.0;
    return [((cx - r.left) - ox)/s, ((cy - r.top) - oy)/s];
  }
  function push(phase, e){
    if(e.cancelable) e.preventDefault();
    for(var i=0;i<e.changedTouches.length;i++){
      var t=e.changedTouches[i];
      var d=toDesign(t.clientX, t.clientY);
      window.__vr.queue.push({id:t.identifier, x:d[0], y:d[1], phase:phase});
    }
  }
  c.addEventListener('touchstart', function(e){push('down',e);}, {passive:false});
  c.addEventListener('touchmove',  function(e){push('move',e);}, {passive:false});
  c.addEventListener('touchend',   function(e){push('up',e);},   {passive:false});
  c.addEventListener('touchcancel',function(e){push('up',e);},   {passive:false});
})();
"""
const JS_POLL := "(function(){if(!window.__vr)return '[]';var q=window.__vr.queue;window.__vr.queue=[];return JSON.stringify(q);})()"

var player: CharacterBody2D
var player_sprite: Sprite2D
var ground_root: Node2D
var items_root: Node2D
var zombies_root: Node2D
var bullets_root: Node2D

var level_index := 0
var counts := {}          # tex -> collected count
var playing := false
var selected_char := 0

var hearts := MAX_HEARTS
var facing := Vector2.RIGHT       # last non-zero move direction (bullet dir)
var move_dir := Vector2.ZERO      # this frame's move direction
var airborne := false
var jump_t := 0.0
var jump_dir := Vector2.ZERO
var last_safe_pos := Vector2.ZERO
var invincible_t := 0.0
var shoot_cd_t := 0.0
var zspawn_t := 0.0
var time_acc := 0.0
var joy_touch_id := JOY_NONE       # touch index (or MOUSE_ID) holding the joystick
var joy_vec := Vector2.ZERO        # analog direction, length 0..1
var joy_center_cur := JOY_CENTER   # dynamic: base recenters where the touch lands

var level_label: Label
var progress_box: HBoxContainer
var progress_labels := {}  # tex -> Label
var popup_label: Label
var overlay: ColorRect
var overlay_title: Label
var overlay_sub: Label
var char_row: HBoxContainer
var char_buttons: Array[Button] = []
var start_button: Button
var hearts_box: HBoxContainer
var heart_rects: Array[TextureRect] = []
var jump_button: Button
var shoot_button: Button
var joy_base: Panel
var joy_knob: Panel
var rotate_overlay: ColorRect
var jp_font: FontFile

func _ready() -> void:
	jp_font = load("res://fonts/PixelMplus12-Bold.ttf")
	randomize()
	ground_root = Node2D.new()
	add_child(ground_root)
	items_root = Node2D.new()
	add_child(items_root)
	bullets_root = Node2D.new()
	add_child(bullets_root)
	_build_player()
	zombies_root = Node2D.new()
	add_child(zombies_root)
	_build_hud()
	_build_level_ground(0)
	_show_select()
	if OS.has_feature("web"):
		JavaScriptBridge.eval(JS_INSTALL)

# ── World ─────────────────────────────────────────────────────────────────────
func _build_level_ground(idx: int) -> void:
	for c in ground_root.get_children():
		c.queue_free()
	var level: Dictionary = LEVELS[idx]
	var tiles := [load("res://art/%s.png" % level["ground"][0]), load("res://art/%s.png" % level["ground"][1])]
	var is_lava_level: bool = level.get("lava", false)
	var lava_tiles := [load("res://art/lava0.png"), load("res://art/lava1.png")] if is_lava_level else []
	var dirt := load("res://art/dirt.png")
	for y in ROWS:
		for x in COLS:
			var s := Sprite2D.new()
			if is_lava_level:
				if LAVA_MAP[y][x] == "L":
					s.texture = lava_tiles[(x * 7 + y * 13) % 2]
				else:
					s.texture = tiles[(x * 7 + y * 13) % 2]
			elif y == 6 or (x == 10 and y > 2):
				s.texture = dirt
			else:
				s.texture = tiles[(x * 7 + y * 13) % 2]
			s.centered = false
			s.position = Vector2(x * TILE, y * TILE)
			ground_root.add_child(s)

func _is_lava(pos: Vector2) -> bool:
	if not LEVELS[level_index].get("lava", false):
		return false
	var tx := int(pos.x / TILE)
	var ty := int(pos.y / TILE)
	if tx < 0 or tx >= COLS or ty < 0 or ty >= ROWS:
		return false
	return LAVA_MAP[ty][tx] == "L"

func _build_player() -> void:
	player = CharacterBody2D.new()
	player_sprite = Sprite2D.new()
	player_sprite.texture = load("res://art/bear.png")
	player.add_child(player_sprite)
	var col := CollisionShape2D.new()
	var shape := CircleShape2D.new()
	shape.radius = 12.0
	col.shape = shape
	player.add_child(col)
	player.position = Vector2(COLS * TILE / 2.0, ROWS * TILE / 2.0)
	add_child(player)

func _spawn_level_items(idx: int) -> void:
	for c in items_root.get_children():
		c.queue_free()
	counts.clear()
	var items: Array = LEVELS[idx]["items"]
	var center := Vector2(COLS * TILE / 2.0, ROWS * TILE / 2.0)
	for kind in items:
		counts[kind["tex"]] = 0
		for i in NEED:
			var area := Area2D.new()
			area.set_meta("tex", kind["tex"])
			area.set_meta("jp", kind["jp"])
			area.set_meta("romaji", kind["romaji"])
			var spr := Sprite2D.new()
			spr.texture = load("res://art/%s.png" % kind["tex"])
			area.add_child(spr)
			var col := CollisionShape2D.new()
			var shape := CircleShape2D.new()
			shape.radius = 12.0
			col.shape = shape
			area.add_child(col)
			var pos := center
			while pos.distance_to(center) < 60.0 or _is_lava(pos):
				pos = Vector2(
					randf_range(TILE, (COLS - 1) * TILE),
					randf_range(TILE * 1.4, (ROWS - 1) * TILE)
				)
			area.position = pos
			area.body_entered.connect(func(body: Node) -> void:
				# Distance check guards against stale physics transforms right
				# after the player teleports at level start.
				if body == player and playing \
						and area.position.distance_to(player.position) < 34.0:
					_collect(area)
			)
			items_root.add_child(area)

# ── Zombies & shooting ────────────────────────────────────────────────────────
func _spawn_zombie() -> void:
	var z := Node2D.new()
	var spr := Sprite2D.new()
	spr.texture = load("res://art/zombie.png")
	z.add_child(spr)
	var side := randi() % 4
	var pos := Vector2.ZERO
	match side:
		0: pos = Vector2(randf_range(0, COLS * TILE), -12)
		1: pos = Vector2(randf_range(0, COLS * TILE), ROWS * TILE + 12)
		2: pos = Vector2(-12, randf_range(0, ROWS * TILE))
		3: pos = Vector2(COLS * TILE + 12, randf_range(0, ROWS * TILE))
	z.position = pos
	zombies_root.add_child(z)

func _shoot() -> void:
	if not playing or shoot_cd_t > 0.0:
		return
	shoot_cd_t = SHOOT_CD
	var b := Node2D.new()
	var spr := Sprite2D.new()
	spr.texture = load("res://art/bullet.png")
	b.add_child(spr)
	b.set_meta("dir", facing)
	b.position = player.position + facing * 18.0
	bullets_root.add_child(b)

func _jump() -> void:
	if not playing or airborne:
		return
	airborne = true
	jump_t = JUMP_TIME
	jump_dir = move_dir

func _hit() -> void:
	hearts -= 1
	_update_hearts()
	invincible_t = 1.5
	_speak("いたい！")
	_show_popup("いたい！", player.position)
	if hearts <= 0:
		_game_over()

func _game_over() -> void:
	playing = false
	_set_buttons(false)
	_speak("ゲームオーバー")
	overlay_title.text = "ゲームオーバー"
	overlay_sub.text = "ゾンビに つかまった… もういちど！"
	char_row.visible = true
	start_button.visible = true
	start_button.text = "もういちど"
	overlay.visible = true

# ── Collection & progress ─────────────────────────────────────────────────────
func _collect(area: Area2D) -> void:
	var tex: String = area.get_meta("tex")
	var jp: String = area.get_meta("jp")
	var romaji: String = area.get_meta("romaji")
	counts[tex] = counts[tex] + 1
	if progress_labels.has(tex):
		progress_labels[tex].text = "%d/%d" % [counts[tex], NEED]
	_speak(jp)
	_show_popup("%s (%s)" % [jp, romaji], area.position)
	area.queue_free()
	_check_level_complete()

func _check_level_complete() -> void:
	for kind in LEVELS[level_index]["items"]:
		if counts.get(kind["tex"], 0) < NEED:
			return
	playing = false
	_set_buttons(false)
	if level_index + 1 < LEVELS.size():
		_speak("レベルクリア！つぎは %s！" % LEVELS[level_index + 1]["name"])
		overlay_title.text = "レベルクリア！"
		overlay_sub.text = "つぎは… %s" % LEVELS[level_index + 1]["name"]
		char_row.visible = false
		start_button.visible = false
		overlay.visible = true
		await get_tree().create_timer(2.2).timeout
		overlay.visible = false
		level_index += 1
		_start_level(level_index)
	else:
		_speak("ぜんぶ クリア！ よくできました！")
		overlay_title.text = "ぜんぶ クリア！"
		overlay_sub.text = "よくできました！"
		char_row.visible = true
		start_button.visible = true
		start_button.text = "もういちど"
		overlay.visible = true
		level_index = 0

func _speak(text: String) -> void:
	if OS.has_feature("web"):
		var js := "var u=new SpeechSynthesisUtterance('%s');u.lang='ja-JP';u.rate=0.9;u.pitch=1.1;speechSynthesis.cancel();speechSynthesis.speak(u);" % text
		JavaScriptBridge.eval(js)

func _show_popup(text: String, world_pos: Vector2) -> void:
	popup_label.text = text
	popup_label.visible = true
	popup_label.position = Vector2(
		clamp(world_pos.x - 60, 8, COLS * TILE - 150),
		clamp(world_pos.y - 44, 40, ROWS * TILE - 40)
	)
	var tw := create_tween()
	popup_label.modulate.a = 1.0
	tw.tween_interval(0.9)
	tw.tween_property(popup_label, "modulate:a", 0.0, 0.4)

# ── HUD ───────────────────────────────────────────────────────────────────────
func _build_hud() -> void:
	var hud := CanvasLayer.new()
	add_child(hud)

	level_label = Label.new()
	level_label.text = ""
	level_label.position = Vector2(12, 6)
	level_label.add_theme_font_size_override("font_size", 18)
	_style(level_label)
	hud.add_child(level_label)

	progress_box = HBoxContainer.new()
	progress_box.position = Vector2(180, 2)
	progress_box.add_theme_constant_override("separation", 10)
	hud.add_child(progress_box)

	hearts_box = HBoxContainer.new()
	hearts_box.position = Vector2(640 - 3 * 28 - 10, 32)
	hearts_box.add_theme_constant_override("separation", 2)
	hud.add_child(hearts_box)
	for i in MAX_HEARTS:
		var hr := TextureRect.new()
		hr.texture = load("res://art/heart.png")
		hr.custom_minimum_size = Vector2(26, 26)
		hr.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		hr.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		hearts_box.add_child(hr)
		heart_rects.append(hr)

	popup_label = Label.new()
	popup_label.visible = false
	popup_label.add_theme_font_size_override("font_size", 20)
	popup_label.add_theme_color_override("font_color", Color(1, 1, 0.6))
	_style(popup_label)
	hud.add_child(popup_label)

	overlay = ColorRect.new()
	overlay.color = Color(0, 0, 0, 0.6)
	overlay.size = Vector2(640, 360)
	hud.add_child(overlay)

	overlay_title = Label.new()
	overlay_title.text = "やさい あつめ"
	overlay_title.add_theme_font_size_override("font_size", 40)
	overlay_title.position = Vector2(195, 42)
	_style(overlay_title)
	overlay.add_child(overlay_title)

	overlay_sub = Label.new()
	overlay_sub.text = "キャラクターを えらんでね！"
	overlay_sub.add_theme_font_size_override("font_size", 20)
	overlay_sub.position = Vector2(185, 105)
	_style(overlay_sub)
	overlay.add_child(overlay_sub)

	char_row = HBoxContainer.new()
	char_row.position = Vector2(148, 140)
	char_row.add_theme_constant_override("separation", 14)
	overlay.add_child(char_row)
	for i in CHARACTERS.size():
		var ch: Dictionary = CHARACTERS[i]
		var b := Button.new()
		b.icon = load("res://art/%s.png" % ch["tex"])
		b.text = ch["jp"]
		b.expand_icon = true
		b.icon_alignment = HORIZONTAL_ALIGNMENT_CENTER
		b.vertical_icon_alignment = VERTICAL_ALIGNMENT_TOP
		b.custom_minimum_size = Vector2(78, 92)
		b.add_theme_font_override("font", jp_font)
		b.add_theme_font_size_override("font_size", 16)
		# Visual only — taps are hit-tested manually in _overlay_touch so every
		# finger works (GUI Buttons only follow the first, emulated-mouse touch).
		b.mouse_filter = Control.MOUSE_FILTER_IGNORE
		char_row.add_child(b)
		char_buttons.append(b)
	_update_char_buttons()

	start_button = Button.new()
	start_button.text = "スタート"
	start_button.add_theme_font_size_override("font_size", 26)
	start_button.add_theme_font_override("font", jp_font)
	start_button.position = Vector2(240, 268)
	start_button.size = Vector2(160, 56)
	start_button.mouse_filter = Control.MOUSE_FILTER_IGNORE
	overlay.add_child(start_button)

	# Roblox-style round touch buttons, bottom-right. These are visuals only —
	# presses are hit-tested in _pointer_press so they work with ANY finger
	# (GUI Buttons only respond to the first touch via mouse emulation, which
	# breaks two-handed play: joystick finger + action finger).
	jump_button = _round_button("ジャンプ", 76, 14)
	jump_button.position = Vector2(640 - 76 - 14, 360 - 76 - 16)
	jump_button.mouse_filter = Control.MOUSE_FILTER_IGNORE
	hud.add_child(jump_button)

	shoot_button = _round_button("うつ", 60, 16)
	shoot_button.position = Vector2(640 - 76 - 14 - 60 - 14, 360 - 60 - 16)
	shoot_button.mouse_filter = Control.MOUSE_FILTER_IGNORE
	hud.add_child(shoot_button)

	# Roblox-style movement joystick, bottom-left
	joy_base = _circle_panel(JOY_R * 2.0, Color(1, 1, 1, 0.16))
	joy_base.position = JOY_CENTER - Vector2(JOY_R, JOY_R)
	hud.add_child(joy_base)
	joy_knob = _circle_panel(JOY_KNOB_R * 2.0, Color(1, 1, 1, 0.42))
	joy_knob.position = JOY_CENTER - Vector2(JOY_KNOB_R, JOY_KNOB_R)
	hud.add_child(joy_knob)
	_set_buttons(false)

	# "Rotate your phone" overlay for portrait mobile (web only), topmost
	rotate_overlay = ColorRect.new()
	rotate_overlay.color = Color(0, 0, 0, 0.88)
	rotate_overlay.size = Vector2(640, 360)
	rotate_overlay.visible = false
	hud.add_child(rotate_overlay)
	var rot_label := Label.new()
	rot_label.text = "スマホを よこむきに してね！"
	rot_label.add_theme_font_size_override("font_size", 26)
	rot_label.position = Vector2(110, 150)
	_style(rot_label)
	rotate_overlay.add_child(rot_label)

func _circle_panel(d: float, col: Color) -> Panel:
	var p := Panel.new()
	p.custom_minimum_size = Vector2(d, d)
	p.size = Vector2(d, d)
	p.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var sb := StyleBoxFlat.new()
	sb.bg_color = col
	sb.set_corner_radius_all(int(d / 2.0))
	sb.border_color = Color(1, 1, 1, 0.55)
	sb.set_border_width_all(3)
	p.add_theme_stylebox_override("panel", sb)
	return p

func _round_button(txt: String, d: int, fs: int) -> Button:
	var b := Button.new()
	b.text = txt
	b.custom_minimum_size = Vector2(d, d)
	b.size = Vector2(d, d)
	b.focus_mode = Control.FOCUS_NONE
	b.add_theme_font_override("font", jp_font)
	b.add_theme_font_size_override("font_size", fs)
	var sb := StyleBoxFlat.new()
	sb.bg_color = Color(1, 1, 1, 0.22)
	sb.set_corner_radius_all(d / 2)
	sb.border_color = Color(1, 1, 1, 0.55)
	sb.set_border_width_all(3)
	b.add_theme_stylebox_override("normal", sb)
	b.add_theme_stylebox_override("hover", sb)
	var sbp: StyleBoxFlat = sb.duplicate()
	sbp.bg_color = Color(1, 1, 1, 0.45)
	b.add_theme_stylebox_override("pressed", sbp)
	return b

func _set_buttons(v: bool) -> void:
	jump_button.visible = v
	shoot_button.visible = v
	joy_base.visible = v
	joy_knob.visible = v
	_joy_release()

func _joy_grab(p: Vector2, id: int) -> void:
	# Roblox-style dynamic thumbstick: the base recenters where the touch lands.
	joy_touch_id = id
	joy_center_cur = Vector2(clampf(p.x, 52.0, 300.0), clampf(p.y, 62.0, 340.0))
	joy_base.position = joy_center_cur - Vector2(JOY_R, JOY_R)
	_joy_update(p)

func _joy_update(p: Vector2) -> void:
	var off := (p - joy_center_cur).limit_length(JOY_R)
	joy_vec = off / JOY_R
	joy_knob.position = joy_center_cur + off - Vector2(JOY_KNOB_R, JOY_KNOB_R)

func _joy_release() -> void:
	joy_touch_id = JOY_NONE
	joy_vec = Vector2.ZERO
	joy_center_cur = JOY_CENTER
	joy_base.position = JOY_CENTER - Vector2(JOY_R, JOY_R)
	joy_knob.position = JOY_CENTER - Vector2(JOY_KNOB_R, JOY_KNOB_R)

func _update_hearts() -> void:
	for i in heart_rects.size():
		heart_rects[i].modulate = Color(1, 1, 1) if i < hearts else Color(0.25, 0.25, 0.25, 0.6)

func _style(l: Label) -> void:
	l.add_theme_font_override("font", jp_font)
	l.add_theme_color_override("font_outline_color", Color(0, 0, 0, 0.8))
	l.add_theme_constant_override("outline_size", 6)

func _build_progress_hud(idx: int) -> void:
	for c in progress_box.get_children():
		c.queue_free()
	progress_labels.clear()
	for kind in LEVELS[idx]["items"]:
		var icon := TextureRect.new()
		icon.texture = load("res://art/%s.png" % kind["tex"])
		icon.custom_minimum_size = Vector2(26, 26)
		icon.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		icon.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		progress_box.add_child(icon)
		var lbl := Label.new()
		lbl.text = "0/%d" % NEED
		lbl.add_theme_font_size_override("font_size", 16)
		_style(lbl)
		progress_box.add_child(lbl)
		progress_labels[kind["tex"]] = lbl

# ── Flow ──────────────────────────────────────────────────────────────────────
func _show_select() -> void:
	playing = false
	_set_buttons(false)
	level_index = 0
	overlay_title.text = "やさい あつめ"
	overlay_sub.text = "キャラクターを えらんでね！"
	char_row.visible = true
	start_button.visible = true
	start_button.text = "スタート"
	overlay.visible = true

func _select_char(i: int) -> void:
	selected_char = i
	_update_char_buttons()
	player_sprite.texture = load("res://art/%s.png" % CHARACTERS[i]["tex"])
	_speak(CHARACTERS[i]["jp"])

func _update_char_buttons() -> void:
	for i in char_buttons.size():
		char_buttons[i].modulate = Color(1, 1, 1) if i == selected_char else Color(0.55, 0.55, 0.58)

func _start_pressed() -> void:
	if not overlay.visible:
		return  # guard against double-fire (raw touch + emulated mouse)
	overlay.visible = false
	if OS.has_feature("web"):
		# Best-effort landscape lock (works in PWA/fullscreen contexts; harmless no-op elsewhere)
		JavaScriptBridge.eval("try{if(screen.orientation&&screen.orientation.lock){screen.orientation.lock('landscape').catch(function(e){})}}catch(e){}")
	level_index = 0
	hearts = MAX_HEARTS
	_update_hearts()
	_start_level(0)

func _start_level(idx: int) -> void:
	level_index = idx
	player.position = Vector2(COLS * TILE / 2.0, ROWS * TILE / 2.0)
	last_safe_pos = player.position
	_build_level_ground(idx)
	_build_progress_hud(idx)
	_spawn_level_items(idx)
	for z in zombies_root.get_children():
		z.queue_free()
	for b in bullets_root.get_children():
		b.queue_free()
	level_label.text = LEVELS[idx]["name"]
	_joy_release()
	airborne = false
	invincible_t = 0.0
	shoot_cd_t = 0.0
	zspawn_t = 1.5
	player_sprite.position = Vector2.ZERO
	player_sprite.scale = Vector2.ONE
	player_sprite.modulate.a = 1.0
	playing = true
	_set_buttons(true)
	_speak("%s！ すたーと！" % LEVELS[idx]["name"])

# ── Movement & combat loop ───────────────────────────────────────────────────
func _process(_delta: float) -> void:
	# Portrait phone → ask to rotate (web only; canvas follows device orientation)
	if OS.has_feature("web"):
		var ws := DisplayServer.window_get_size()
		rotate_overlay.visible = ws.y > ws.x
		_poll_web_touches()

func _poll_web_touches() -> void:
	var res: Variant = JavaScriptBridge.eval(JS_POLL)
	if typeof(res) != TYPE_STRING or res == "" or res == "[]":
		return
	var arr: Variant = JSON.parse_string(res)
	if not (arr is Array):
		return
	for e in arr:
		var p := Vector2(float(e["x"]), float(e["y"]))
		var id := int(e["id"])
		match e["phase"]:
			"down":
				_pointer_press(p, id)
			"move":
				_pointer_move(p, id)
			"up":
				_pointer_release(id)

func _physics_process(delta: float) -> void:
	if not playing or rotate_overlay.visible:
		return
	time_acc += delta
	if invincible_t > 0.0:
		invincible_t -= delta
		player_sprite.modulate.a = 0.4 + 0.6 * absf(sin(time_acc * 20.0))
		if invincible_t <= 0.0:
			player_sprite.modulate.a = 1.0
	if shoot_cd_t > 0.0:
		shoot_cd_t -= delta

	# player input: keyboard or held joystick only — releasing stops instantly
	var dir := Input.get_vector("move_left", "move_right", "move_up", "move_down")
	if dir == Vector2.ZERO and joy_vec.length() > 0.12:
		dir = joy_vec.limit_length(1.0)
	move_dir = dir
	if dir != Vector2.ZERO:
		facing = dir.normalized()
		player_sprite.flip_h = dir.x < 0

	var prev := player.position
	if airborne:
		jump_t -= delta
		var prog := clampf(1.0 - jump_t / JUMP_TIME, 0.0, 1.0)
		player_sprite.position.y = -28.0 * sin(PI * prog)
		var sc := 1.0 + 0.35 * sin(PI * prog)
		player_sprite.scale = Vector2(sc, sc)
		player.velocity = jump_dir * SPEED * JUMP_BOOST
		player.move_and_slide()
	else:
		player.velocity = dir * SPEED
		player.move_and_slide()
	player.position.x = clamp(player.position.x, 16, COLS * TILE - 16)
	player.position.y = clamp(player.position.y, 16, ROWS * TILE - 16)

	if airborne and jump_t <= 0.0:
		# landing
		airborne = false
		player_sprite.position = Vector2.ZERO
		player_sprite.scale = Vector2.ONE
		if _is_lava(player.position):
			player.position = last_safe_pos
			_hit()
	elif not airborne and _is_lava(player.position):
		# walking into lava: blocked — slide along the edge if one axis is clear
		if not _is_lava(Vector2(player.position.x, prev.y)):
			player.position.y = prev.y
		elif not _is_lava(Vector2(prev.x, player.position.y)):
			player.position.x = prev.x
		else:
			player.position = prev
	if not airborne and not _is_lava(player.position):
		last_safe_pos = player.position

	# zombies: spawn + chase
	zspawn_t -= delta
	if zspawn_t <= 0.0:
		zspawn_t = ZOMBIE_SPAWN_EVERY
		if zombies_root.get_child_count() < ZOMBIE_MAX[level_index]:
			_spawn_zombie()
	var zspeed := 40.0 + level_index * 10.0
	for z in zombies_root.get_children():
		if z.is_queued_for_deletion():
			continue
		var to_player: Vector2 = player.position - z.position
		z.position += to_player.normalized() * zspeed * delta
		var zs: Sprite2D = z.get_child(0)
		zs.rotation = sin(time_acc * 8.0 + z.get_index()) * 0.12
		zs.flip_h = to_player.x < 0
		if not airborne and invincible_t <= 0.0 and to_player.length() < 22.0:
			z.queue_free()
			_hit()
			if not playing:
				return

	# bullets: fly + hit zombies
	for b in bullets_root.get_children():
		if b.is_queued_for_deletion():
			continue
		b.position += (b.get_meta("dir") as Vector2) * BULLET_SPEED * delta
		if b.position.x < -16 or b.position.x > COLS * TILE + 16 \
				or b.position.y < -16 or b.position.y > ROWS * TILE + 16:
			b.queue_free()
			continue
		for z in zombies_root.get_children():
			if z.is_queued_for_deletion():
				continue
			if z.position.distance_to(b.position) < 18.0:
				_show_popup("やっつけた！", z.position)
				z.queue_free()
				b.queue_free()
				break

# Pointer handling lives in _input (NOT _unhandled_input) so it runs BEFORE the
# GUI system. Otherwise a Control with the default MOUSE_FILTER_STOP — the modal
# overlay, or a collect/やっつけた popup Label drifting over a touch button —
# swallows the touch first and the button silently misses ("sometimes doesn't
# press"). Running here, every tap reaches us regardless of what's on screen.
func _input(event: InputEvent) -> void:
	# Multi-touch (Roblox-style): left half = dynamic joystick, right-side circles
	# = shoot/jump, overlay screen = manual button hit-test. Every finger works.
	# Touch-emulated mouse events (device == DEVICE_ID_EMULATION) are skipped —
	# the touch branch already handled them.
	var web := OS.has_feature("web")
	if event is InputEventScreenTouch:
		# On web, Godot's touch coords are wrong on HiDPI — we handle touches via
		# the JS listener in _poll_web_touches instead. Native/editor use these.
		if web:
			return
		if event.pressed:
			_pointer_press(event.position, event.index)
		else:
			_pointer_release(event.index)
	elif event is InputEventScreenDrag:
		if web:
			return
		_pointer_move(event.position, event.index)
	elif event is InputEventMouseButton:
		if event.device == InputEvent.DEVICE_ID_EMULATION:
			return
		if event.pressed:
			_pointer_press(event.position, MOUSE_ID)
		else:
			_pointer_release(MOUSE_ID)
	elif event is InputEventMouseMotion:
		if event.device == InputEvent.DEVICE_ID_EMULATION:
			return
		if event.button_mask != 0:
			_pointer_move(event.position, MOUSE_ID)

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and not event.echo:
		match event.physical_keycode:
			KEY_SPACE:
				_jump()
			KEY_X, KEY_Z:
				_shoot()

func _btn_center(b: Button) -> Vector2:
	return b.position + b.size / 2.0

func _flash(b: Button) -> void:
	b.modulate = Color(1.6, 1.6, 1.6)
	var tw := create_tween()
	tw.tween_property(b, "modulate", Color(1, 1, 1), 0.18)

func _pointer_press(p: Vector2, id: int) -> void:
	if rotate_overlay.visible:
		return
	if overlay.visible:
		_overlay_touch(p)
		return
	if not playing:
		return
	# action circles, bottom-right (any finger). Hit radius == the visible circle
	# radius (button.size/2) so taps register only where the button is drawn.
	if p.distance_to(_btn_center(shoot_button)) <= shoot_button.size.x * 0.5:
		_flash(shoot_button)
		_shoot()
		return
	if p.distance_to(_btn_center(jump_button)) <= jump_button.size.x * 0.5:
		_flash(jump_button)
		_jump()
		return
	# left half of the screen grabs the movement joystick
	if joy_touch_id == JOY_NONE and p.x < 320.0:
		_joy_grab(p, id)

func _pointer_move(p: Vector2, id: int) -> void:
	if id == joy_touch_id:
		_joy_update(p)

func _pointer_release(id: int) -> void:
	if id == joy_touch_id:
		_joy_release()

func _overlay_touch(p: Vector2) -> void:
	# Manual hit-test for the select screen so taps from any finger register.
	# Handlers are idempotent, so a duplicate emulated-mouse GUI press is harmless.
	for i in char_buttons.size():
		if char_row.visible and char_buttons[i].get_global_rect().has_point(p):
			_select_char(i)
			return
	if start_button.visible and start_button.get_global_rect().has_point(p):
		_start_pressed()
