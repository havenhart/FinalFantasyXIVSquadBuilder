<script>
	import squad from "../Stores/squad-store.js";
	export let memberId = 0;
	export let selected = false;
	export let active = false;

	$:member = $squad.find(s => s.id === memberId);

</script>
<style>
	.squadmember {
		list-style-position: inside !important;
		border: double 3px brown !important;
		cursor: pointer;
	}

	.squadmember:hover {
		background-color: aliceblue;
	}

	.selectedmember {
		background-color: aliceblue;
	}

	.activemember  {
		background-color: cyan !important;
    }
</style>

<li class="list-group-item squadmember" class:selectedmember="{selected}" class:activemember="{active}" on:click>
    <b>{member.name}</b><br>
    P: {member.physical} / M: {member.mental} / T: {member.tactical}		
</li>