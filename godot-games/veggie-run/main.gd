extends Node2D
# ── Veggie Run 「やさいあつめ」──────────────────────────────────────────────
# Top-down farm: walk the bear around, collect vegetables before time runs
# out. Each pickup speaks the vegetable's Japanese name (Web Speech API).

const TILE := 32
const COLS := 20
const ROWS := 12
const SPEED := 150.0
const GAME_SECONDS := 60
const VEGGIE_COUNT := 6

const VEGGIES := [
	{"tex": "carrot",   "jp": "にんじん",   "romaji": "ninjin"},
	{"tex": "tomato",   "jp": "とまと",     "romaji": "tomato"},
	{"tex": "eggplant", "jp": "なす",       "romaji": "nasu"},
	{"tex": "corn",     "jp": "とうもろこし", "romaji": "toumorokoshi"},
	{"tex": "pumpkin",  "jp": "かぼちゃ",   "romaji": "kabocha"},
]

var player: CharacterBody2D
var score := 0
var time_left := GAME_SECONDS
var playing := false
var pointer_target := Vector2.ZERO
var pointer_active := false

var score_label: Label
var time_label: Label
var popup_label: Label
var overlay: ColorRect
var overlay_title: Label
var overlay_score: Label
var start_button: Button
var jp_font: FontFile

func _ready() -> void:
	jp_font = load("res://fonts/PixelMplus12-Bold.ttf")
	randomize()
	_build_ground()
	_build_player()
	for i in VEGGIE_COUNT:
		_spawn_veggie()
	_build_hud()
	_show_start()

# ── World ─────────────────────────────────────────────────────────────────────
func _build_ground() -> void:
	var grass := [load("res://art/grass0.png"), load("res://art/grass1.png")]
	var dirt := load("res://art/dirt.png")
	for y in ROWS:
		for x in COLS:
			var s := Sprite2D.new()
			# a dirt path crossing the field
			if y == 6 or (x == 10 and y > 2):
				s.texture = dirt
			else:
				s.texture = grass[(x * 7 + y * 13) % 2]
			s.centered = false
			s.position = Vector2(x * TILE, y * TILE)
			add_child(s)

func _build_player() -> void:
	player = CharacterBody2D.new()
	var spr := Sprite2D.new()
	spr.texture = load("res://art/bear.png")
	player.add_child(spr)
	var col := CollisionShape2D.new()
	var shape := CircleShape2D.new()
	shape.radius = 12.0
	col.shape = shape
	player.add_child(col)
	player.position = Vector2(COLS * TILE / 2.0, ROWS * TILE / 2.0)
	add_child(player)

func _spawn_veggie() -> void:
	var kind: Dictionary = VEGGIES[randi() % VEGGIES.size()]
	var area := Area2D.new()
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
	area.position = Vector2(
		randf_range(TILE, (COLS - 1) * TILE),
		randf_range(TILE, (ROWS - 1) * TILE)
	)
	area.body_entered.connect(func(body: Node) -> void:
		if body == player and playing:
			_collect(area)
	)
	add_child(area)

func _collect(area: Area2D) -> void:
	score += 1
	score_label.text = "やさい: %d" % score
	var jp: String = area.get_meta("jp")
	var romaji: String = area.get_meta("romaji")
	_speak(jp)
	_show_popup("%s (%s)" % [jp, romaji], area.position)
	area.queue_free()
	_spawn_veggie()

func _speak(text: String) -> void:
	if OS.has_feature("web"):
		var js := "var u=new SpeechSynthesisUtterance('%s');u.lang='ja-JP';u.rate=0.9;u.pitch=1.1;speechSynthesis.cancel();speechSynthesis.speak(u);" % text
		JavaScriptBridge.eval(js)

func _show_popup(text: String, world_pos: Vector2) -> void:
	popup_label.text = text
	popup_label.visible = true
	popup_label.position = Vector2(
		clamp(world_pos.x - 60, 8, COLS * TILE - 140),
		clamp(world_pos.y - 44, 8, ROWS * TILE - 40)
	)
	var tw := create_tween()
	popup_label.modulate.a = 1.0
	tw.tween_interval(0.9)
	tw.tween_property(popup_label, "modulate:a", 0.0, 0.4)

# ── HUD & flow ────────────────────────────────────────────────────────────────
func _build_hud() -> void:
	var hud := CanvasLayer.new()
	add_child(hud)

	score_label = Label.new()
	score_label.text = "やさい: 0"
	score_label.position = Vector2(12, 8)
	score_label.add_theme_font_size_override("font_size", 22)
	_style(score_label)
	hud.add_child(score_label)

	time_label = Label.new()
	time_label.text = "のこり %d" % GAME_SECONDS
	time_label.position = Vector2(520, 8)
	time_label.add_theme_font_size_override("font_size", 22)
	_style(time_label)
	hud.add_child(time_label)

	popup_label = Label.new()
	popup_label.visible = false
	popup_label.add_theme_font_size_override("font_size", 20)
	popup_label.add_theme_color_override("font_color", Color(1, 1, 0.6))
	_style(popup_label)
	hud.add_child(popup_label)

	overlay = ColorRect.new()
	overlay.color = Color(0, 0, 0, 0.55)
	overlay.size = Vector2(640, 360)
	hud.add_child(overlay)

	overlay_title = Label.new()
	overlay_title.text = "やさい あつめ"
	overlay_title.add_theme_font_size_override("font_size", 44)
	overlay_title.position = Vector2(175, 84)
	_style(overlay_title)
	overlay.add_child(overlay_title)

	overlay_score = Label.new()
	overlay_score.text = "やさいを あつめよう！"
	overlay_score.add_theme_font_size_override("font_size", 22)
	overlay_score.position = Vector2(205, 160)
	_style(overlay_score)
	overlay.add_child(overlay_score)

	start_button = Button.new()
	start_button.text = "スタート"
	start_button.add_theme_font_size_override("font_size", 26)
	start_button.add_theme_font_override("font", jp_font)
	start_button.position = Vector2(240, 220)
	start_button.size = Vector2(160, 56)
	start_button.pressed.connect(_start_game)
	overlay.add_child(start_button)

	var timer := Timer.new()
	timer.wait_time = 1.0
	timer.timeout.connect(_tick)
	timer.autostart = true
	add_child(timer)

func _style(l: Label) -> void:
	l.add_theme_font_override("font", jp_font)
	l.add_theme_color_override("font_outline_color", Color(0, 0, 0, 0.8))
	l.add_theme_constant_override("outline_size", 6)

func _show_start() -> void:
	playing = false
	overlay.visible = true

func _start_game() -> void:
	score = 0
	time_left = GAME_SECONDS
	score_label.text = "やさい: 0"
	time_label.text = "のこり %d" % time_left
	overlay.visible = false
	playing = true
	_speak("すたーと")

func _tick() -> void:
	if not playing:
		return
	time_left -= 1
	time_label.text = "のこり %d" % time_left
	if time_left <= 0:
		playing = false
		overlay_title.text = "おしまい！"
		overlay_score.text = "やさい: %d こ" % score
		start_button.text = "もういちど"
		overlay.visible = true
		_speak("おしまい！ %d こ あつめました" % score)

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
