<script>
	import { createEventDispatcher } from"svelte";
	import SquadItem from "./SquadItem.svelte";
	import squad from "../Stores/squad-store.js";

	export let selectedID = -1;
	export let activeMembers = [];

	const dispatch = createEventDispatcher();

	$:squadCount = $squad.length;
</script>
<style>
    .card {
		margin-bottom: 10px !important;
	}

	.card-header {
		font-weight: bold;
		font-size: large;
	}
</style>

<div class="card">
    <div class="card-header">Squad Members ({squadCount} of 8)</div>
    <div class="card-body">
		<ul class="list-group">
		{#each $squad as member}
			<SquadItem 
				memberId={member.id} 
				selected={member.id === selectedID} 
				active={activeMembers.includes(member.id)}
				on:click={() => {
					dispatch("item-selected", member.id);
				} }/>
		{/each}
		</ul>
    </div>
</div>