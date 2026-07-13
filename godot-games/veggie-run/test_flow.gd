extends SceneTree
# Headless flow test: character select → shoot a zombie → take damage →
# level 1..3 collect-all (level 3 = lava cave) → final clear → game over path.
# Run with:
#   godot --headless --path . -s test_flow.gd

func _init() -> void:
	_run.call_deferred()

func _run() -> void:
	await process_frame
	var main: Node = load("res://main.tscn").instantiate()
	root.add_child(main)
	await process_frame

	main._select_char(1)
	assert(main.selected_char == 1, "char select failed")
	main._start_pressed()
	await process_frame
	assert(main.playing, "not playing after start")
	assert(main.level_index == 0, "should start at level 0")
	assert(main.hearts == 3, "should start with 3 hearts")

	# ── zombie auto-spawn (zspawn timer) ──
	await create_timer(4.5).timeout
	print("[test] auto-spawned zombies: ", main.zombies_root.get_child_count())
	assert(main.zombies_root.get_child_count() >= 1, "zombies should auto-spawn while playing")
	for z0 in main.zombies_root.get_children():
		z0.free()

	# ── zombie + shooting ──
	main._spawn_zombie()
	assert(main.zombies_root.get_child_count() >= 1, "zombie should spawn")
	var z: Node2D = main.zombies_root.get_child(0)
	z.position = main.player.position + Vector2(80, 0)
	main.facing = Vector2.RIGHT
	main._shoot()
	assert(main.bullets_root.get_child_count() == 1, "bullet should spawn")
	await create_timer(0.6).timeout
	assert(not is_instance_valid(z) or z.is_queued_for_deletion(), "zombie should die from bullet")
	print("[test] zombie shot OK")

	# ── damage / hearts ──
	main._hit()
	assert(main.hearts == 2, "hit should cost a heart")
	main.hearts = 99  # keep auto-spawned zombies from ending the run mid-test

	# ── dynamic virtual joystick (Roblox-style, left half) ──
	var jc := Vector2(150, 250)
	var touch := InputEventScreenTouch.new()
	touch.index = 0
	touch.pressed = true
	touch.position = jc
	main._unhandled_input(touch)
	assert(main.joy_touch_id == 0, "joystick should grab a left-half touch")
	assert(main.joy_center_cur.distance_to(jc) < 1.0, "joystick base should recenter on the touch")
	assert(main.joy_vec == Vector2.ZERO, "no drag yet → no movement")
	var drag := InputEventScreenDrag.new()
	drag.index = 0
	drag.position = jc + Vector2(42, 0)
	main._unhandled_input(drag)
	assert(main.joy_vec.x > 0.9 and absf(main.joy_vec.y) < 0.1, "joy_vec should point right")
	var px: float = main.player.position.x
	await create_timer(0.4).timeout
	assert(main.player.position.x > px + 10.0, "joystick should move player right")
	var lift := InputEventScreenTouch.new()
	lift.index = 0
	lift.pressed = false
	main._unhandled_input(lift)
	assert(main.joy_vec == Vector2.ZERO, "joystick should reset on release")
	var vx: float = main.player.position.x
	await create_timer(0.25).timeout
	assert(absf(main.player.position.x - vx) < 1.0, "player must stop immediately on release")
	print("[test] joystick OK")

	# ── multi-touch action circles: 2nd finger shoots while 1st holds joystick ──
	var touch2 := InputEventScreenTouch.new()
	touch2.index = 0
	touch2.pressed = true
	touch2.position = jc
	main._unhandled_input(touch2)
	var shoot_touch := InputEventScreenTouch.new()
	shoot_touch.index = 1
	shoot_touch.pressed = true
	shoot_touch.position = main._btn_center(main.shoot_button)
	var bullets_before: int = main.bullets_root.get_child_count()
	main._unhandled_input(shoot_touch)
	assert(main.bullets_root.get_child_count() == bullets_before + 1,
		"second finger should fire while joystick is held")
	var lift2 := InputEventScreenTouch.new()
	lift2.index = 0
	lift2.pressed = false
	main._unhandled_input(lift2)
	print("[test] multitouch shoot OK")

	# ── overlay touch fallback: select + start via raw touch hit-test ──
	main._show_select()
	var sel_touch := InputEventScreenTouch.new()
	sel_touch.index = 1
	sel_touch.pressed = true
	sel_touch.position = main.char_buttons[2].get_global_rect().get_center()
	main._unhandled_input(sel_touch)
	assert(main.selected_char == 2, "overlay touch should select character")
	var start_touch := InputEventScreenTouch.new()
	start_touch.index = 1
	start_touch.pressed = true
	start_touch.position = main.start_button.get_global_rect().get_center()
	main._unhandled_input(start_touch)
	await process_frame
	assert(main.playing, "overlay touch should start the game")
	assert(main.level_index == 0, "restart back at level 0")
	main.hearts = 99
	print("[test] overlay touch OK")

	# ── jump (in place — don't drift into items) ──
	main.move_dir = Vector2.ZERO
	main._jump()
	assert(main.airborne, "jump should set airborne")
	await create_timer(0.7).timeout
	assert(not main.airborne, "should land after jump")

	# The joystick walk above may have legitimately picked up an item or two,
	# so collect whatever remains instead of assuming all 20 are left.
	var items: Array = main.items_root.get_children()
	print("[test] L1 items left: ", items.size(), " counts=", main.counts)
	assert(items.size() >= 18, "too few level-1 items remain")
	for a in items:
		if not a.is_queued_for_deletion():
			main._collect(a)
	print("[test] after L1 collect: playing=", main.playing, " level=", main.level_index)
	assert(not main.playing, "should pause during level-clear overlay")

	await create_timer(3.0).timeout
	print("[test] after transition: level=", main.level_index, " playing=", main.playing,
		" items=", main.items_root.get_child_count())
	assert(main.level_index == 1, "should be on level 1 (fruits)")
	assert(main.playing, "should be playing level 2")
	var fruits: Array = main.items_root.get_children()
	if fruits.size() != 20:
		print("[debug] player=", main.player.position, " counts=", main.counts,
			" joy_vec=", main.joy_vec)
	assert(fruits.size() == 20, "expected 20 level-2 items")
	var kinds := {}
	for a in fruits:
		kinds[a.get_meta("tex")] = true
	print("[test] L2 kinds: ", kinds.keys())
	assert(kinds.has("apple"), "level 2 should have fruits")
	main.hearts = 99

	for a in fruits:
		main._collect(a)
	await create_timer(3.0).timeout
	assert(main.level_index == 2, "should be on level 2 (lava cave)")
	assert(main.playing, "should be playing level 3")
	var mixed: Array = main.items_root.get_children()
	assert(mixed.size() == 20, "expected 20 level-3 items")
	for a in mixed:
		assert(not main._is_lava(a.position), "items must not spawn on lava")
	assert(main._is_lava(Vector2(2.5 * 32, 1.5 * 32)), "tile (2,1) should be lava")
	assert(not main._is_lava(Vector2(0.5 * 32, 0.5 * 32)), "tile (0,0) should be walkable")
	print("[test] L3 lava map OK, items: ", mixed.size())
	main.hearts = 99

	# ── landing on lava after a jump: damage + return to safe spot ──
	var safe := Vector2(0.5 * 32, 0.5 * 32)
	main.last_safe_pos = safe
	main.player.position = Vector2(2.5 * 32, 1.5 * 32)  # lava tile
	main.airborne = true
	main.jump_t = 0.0001
	main.jump_dir = Vector2.ZERO
	var hearts_before: int = main.hearts
	await create_timer(0.2).timeout
	assert(not main.airborne, "should have landed")
	assert(main.hearts == hearts_before - 1, "landing on lava should cost a heart")
	assert(main.player.position.distance_to(safe) < 20.0, "should return to last safe spot")
	print("[test] lava landing OK")

	for a in mixed:
		main._collect(a)
	await create_timer(0.5).timeout
	print("[test] final: level=", main.level_index, " playing=", main.playing,
		" overlay=", main.overlay.visible, " title=", main.overlay_title.text)
	assert(not main.playing, "should stop after final clear")
	assert(main.overlay.visible, "final overlay should show")

	# ── game over path ──
	main._start_pressed()
	await process_frame
	assert(main.hearts == 3, "hearts should reset on restart")
	main._hit()
	main._hit()
	main._hit()
	await process_frame
	assert(not main.playing, "game over should stop play")
	assert(main.overlay.visible, "game-over overlay should show")
	assert(main.overlay_title.text == "ゲームオーバー", "game-over title")
	print("[test] game over OK")

	print("[test] ALL PASS")
	quit(0)
