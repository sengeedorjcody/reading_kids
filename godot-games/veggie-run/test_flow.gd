extends SceneTree
# Headless flow test: character select → level 1 collect-all → level 2
# transition → collect-all → final clear screen. Run with:
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

	for a in fruits:
		main._collect(a)
	await create_timer(0.5).timeout
	print("[test] final: level=", main.level_index, " playing=", main.playing,
		" overlay=", main.overlay.visible, " title=", main.overlay_title.text)
	assert(not main.playing, "should stop after final clear")
	assert(main.overlay.visible, "final overlay should show")

	print("[test] ALL PASS")
	quit(0)
