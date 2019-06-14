<script>
	import { createEventDispatcher } from"svelte";
	import SquadItem from "./SquadItem.svelte";
	import squad from "../Stores/squad-store.js";

	export let selectedID = -1;
	export let activeMembers = [];
	export let needsTraining = false;

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

	.swatch-success {
		display: inline-block;
		width: 10px;
		height: 10px;
		background-color: cyan;
		border: 1px solid black;
	}

	.swatch-training {
		display: inline-block;
		width: 10px;
		height: 10px;
		background-color: orange;
		border: 1px solid black;
	}

	dl {
		margin-bottom:10px;
	}

	dt {
		display: inline;
		margin-right: 10px;
	}

	dd {
		display: inline-block;
	} 

	.legend {
		padding: 15px 0px 10px 10px;

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
				active={member.active}
				needsTraining={needsTraining}
				on:click={() => {
					dispatch("item-selected", member.id);
				} }/>
		{/each}
		</ul>
    </div>
</div>
<div class="card legend">
	<dl>
		<dt><span class="swatch-success"></span></dt>
		<dd>Success</dd>		
	</dl>
	<dl>
		<dt><span class="swatch-training"></span></dt>
		<dd>Success after Recommended Training</dd>
	</dl>
</div>