<script>
	import { onMount } from "svelte";
	import SquadList from "./Components/Squadlist.svelte";
	import SquadEditor from "./Components/SquadEditor.svelte";
	import SquadCalculator from "./Components/SquadCalculator.svelte";
	import squad from "./Stores/squad-store.js";
	import squadConfig from "./Stores/configuration-store.js";

	let selectedID = -1;
	let activeMembers = [];

	function itemSelected(event){		
		selectedID = event.detail;
		let member = $squad.find(s => s.id === selectedID);
		member.selected = true;
	}

	function clearSelectedItem(){
		selectedID = -1
		let member = $squad.find(s => s.selected === true);
		if(member){ member.selected = false; }
	}

onMount(() => {
	squad.init();
	squadConfig.init();
});
</script>

<style>	
	
</style>

<div class="row">
	<div class="col-4">
			<SquadList on:item-selected={itemSelected} selectedID={selectedID} activeMembers={activeMembers} />
	</div>
	<div class="col-8">
		<SquadEditor selectedID={selectedID} on:editor-complete={clearSelectedItem}/>
		<SquadCalculator/>
	</div>
</div>