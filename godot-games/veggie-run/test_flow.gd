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

	# ── jump ──
	main._jump()
	assert(main.airborne, "jump should set airborne")
	await create_timer(0.7).timeout
	assert(not main.airborne, "should land after jump")

	var items: Array = main.items_root.get_children()
	print("[test] L1 items: ", items.size())
	assert(items.size() == 20, "expected 20 level-1 items")
	for a in items:
		main._collect(a)
	print("[test] after L1 collect: playing=", main.playing, " level=", main.level_index)
	assert(not main.playing, "should pause during level-clear overlay")

	await create_timer(3.0).timeout
	print("[test] after transition: level=", main.level_index, " playing=", main.playing,
		" items=", main.items_root.get_child_count())
	assert(main.level_index == 1, "should be on level 1 (fruits)")
	assert(main.playing, "should be playing level 2")
	var fruits: Array = main.items_root.get_children()
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
	await process_frame
	await process_frame
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
