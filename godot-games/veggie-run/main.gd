extends Node2D
# ── Veggie Run 「やさいあつめ」──────────────────────────────────────────────
# Pick a character, then collect 4 of every vegetable to clear level 1.
# Level 2 is an orchard with fruits — 4 of each again. Every pickup speaks
# the item's Japanese name (Web Speech API via JavaScriptBridge).

const TILE := 32
const COLS := 20
const ROWS := 12
const SPEED := 150.0
const NEED := 4  # how many of each kind to collect

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

const LEVELS := [
	{"name": "やさい ばたけ", "ground": ["grass0", "grass1"],     "items": VEGGIES},
	{"name": "くだもの えん", "ground": ["orchard0", "orchard1"], "items": FRUITS},
]

var player: CharacterBody2D
var player_sprite: Sprite2D
var ground_root: Node2D
var items_root: Node2D

var level_index := 0
var counts := {}          # tex -> collected count
var playing := false
var selected_char := 0
var pointer_target := Vector2.ZERO
var pointer_active := false

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
var jp_font: FontFile

func _ready() -> void:
	jp_font = load("res://fonts/PixelMplus12-Bold.ttf")
	randomize()
	ground_root = Node2D.new()
	add_child(ground_root)
	items_root = Node2D.new()
	add_child(items_root)
	_build_player()
	_build_hud()
	_build_level_ground(0)
	_show_select()

# ── World ─────────────────────────────────────────────────────────────────────
func _build_level_ground(idx: int) -> void:
	for c in ground_root.get_children():
		c.queue_free()
	var level: Dictionary = LEVELS[idx]
	var tiles := [load("res://art/%s.png" % level["ground"][0]), load("res://art/%s.png" % level["ground"][1])]
	var dirt := load("res://art/dirt.png")
	for y in ROWS:
		for x in COLS:
			var s := Sprite2D.new()
			if y == 6 or (x == 10 and y > 2):
				s.texture = dirt
			else:
				s.texture = tiles[(x * 7 + y * 13) % 2]
			s.centered = false
			s.position = Vector2(x * TILE, y * TILE)
			ground_root.add_child(s)

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
			while pos.distance_to(center) < 60.0:
				pos = Vector2(
					randf_range(TILE, (COLS - 1) * TILE),
					randf_range(TILE * 1.4, (ROWS - 1) * TILE)
				)
			area.position = pos
			area.body_entered.connect(func(body: Node) -> void:
				if body == player and playing:
					_collect(area)
			)
			items_root.add_child(area)

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
		b.pressed.connect(_select_char.bind(i))
		char_row.add_child(b)
		char_buttons.append(b)
	_update_char_buttons()

	start_button = Button.new()
	start_button.text = "スタート"
	start_button.add_theme_font_size_override("font_size", 26)
	start_button.add_theme_font_override("font", jp_font)
	start_button.position = Vector2(240, 268)
	start_button.size = Vector2(160, 56)
	start_button.pressed.connect(_start_pressed)
	overlay.add_child(start_button)

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
	overlay.visible = false
	level_index = 0
	_start_level(0)

func _start_level(idx: int) -> void:
	_build_level_ground(idx)
	_build_progress_hud(idx)
	_spawn_level_items(idx)
	level_label.text = LEVELS[idx]["name"]
	player.position = Vector2(COLS * TILE / 2.0, ROWS * TILE / 2.0)
	pointer_active = false
	playing = true
	_speak("%s！ すたーと！" % LEVELS[idx]["name"])

# ── Movement ──────────────────────────────────────────────────────────────────
func _physics_process(_delta: float) -> void:
	if not playing:
		return
	var dir := Input.get_vector("move_left", "move_right", "move_up", "move_down")
	if dir != Vector2.ZERO:
		pointer_active = false  # keyboard overrides tap-to-move
	elif pointer_active:
		var to_target := pointer_target - player.position
		if to_target.length() > 6.0:
			dir = to_target.normalized()
		else:
			pointer_active = false
	player.velocity = dir * SPEED
	player.move_and_slide()
	player.position.x = clamp(player.position.x, 16, COLS * TILE - 16)
	player.position.y = clamp(player.position.y, 16, ROWS * TILE - 16)

func _unhandled_input(event: InputEvent) -> void:
	# Tap/click anywhere → walk there until reached; dragging retargets live.
	if event is InputEventScreenTouch and event.pressed:
		pointer_active = true
		pointer_target = _to_world(event.position)
	elif event is InputEventScreenDrag:
		pointer_active = true
		pointer_target = _to_world(event.position)
	elif event is InputEventMouseButton and event.pressed:
		pointer_active = true
		pointer_target = _to_world(event.position)
	elif event is InputEventMouseMotion and event.button_mask != 0:
		pointer_active = true
		pointer_target = _to_world(event.position)

func _to_world(screen_pos: Vector2) -> Vector2:
	return get_canvas_transform().affine_inverse() * screen_pos
