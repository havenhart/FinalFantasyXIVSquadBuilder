<script>
	import { onMount } from "svelte";
	import SquadList from "./Components/Squadlist.svelte";
	import SquadEditor from "./Components/SquadEditor.svelte";
	import SquadCalculator from "./Components/SquadCalculator.svelte";
	import squad from "./Stores/squad-store.js";
	import squadConfig from "./Stores/configuration-store.js";

	let needsTraining = false;
	let selectedID = -1;
	let activeMembers = [];
	let activeSquadTotals  = { physical: 0, mental: 0, tactical: 0, training: 'training' };
	

	function itemSelected(event){		
		selectedID = event.detail;
		let member = $squad.find(s => s.id === selectedID);
		member.selected = true;
	}

	function calculateSquad(event){
		fetch('https://localhost:44365/api/Squad/Calculate',
		{
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			method: 'POST',
			body: JSON.stringify({
				members: $squad,
				attributes: $squadConfig
			})
		})
		.then(rlt => {
			if(!rlt.ok){
				throw new Error('Failed to Calculate');
			}
			return rlt.json();
		})
		.then(data => {
				if(data.errorMessage){
					needsTraining = true;
					activeSquadTotals = { 
						physical: 0, 
						mental: 0, 
						tactical: 0, 
						training: data.errorMessage };
					squad.activate({
						member1: -1,
						member2: -1,
						member3: -1,
						member4: -1
						});
				}else{
					needsTraining = !(data.training === 'None');
					activeSquadTotals = { 
						physical: data.calcTotals.physical, 
						mental: data.calcTotals.mental, 
						tactical: data.calcTotals.tactical, 
						training: data.training };
					squad.activate({
						member1: data.member1,
						member2: data.member2,
						member3: data.member3,
						member4: data.member4
						});
				}
			})
		.catch(err => {
			console.log(err);
		});
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
			<SquadList on:item-selected={itemSelected} selectedID={selectedID} activeMembers={activeMembers} needsTraining={needsTraining} />
	</div>
	<div class="col-8">
		<SquadEditor selectedID={selectedID} on:editor-complete={clearSelectedItem}/>
		<SquadCalculator on:calculate={calculateSquad} activeSquadTotals={activeSquadTotals}/>
	</div>
</div>