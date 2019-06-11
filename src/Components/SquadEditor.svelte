<script>
    import { createEventDispatcher } from"svelte";
    import squad from "../Stores/squad-store.js";
    
    export let selectedID = -1;
    let currentMember = null;
    
    let currentId = 0;
    let name = "";
    let physical = 0;
    let mental = 0;
    let tactical = 0;

	const dispatch = createEventDispatcher();

$:if(selectedID !== currentId){
    if(selectedID > -1){
        const unsubscribe = squad.subscribe(data => {
            currentMember = $squad.find(s => s.id === selectedID) || {id: 0, name: "", physical: 0, mental: 0, tactical: 0};
            name = currentMember.name;
            physical = currentMember.physical;
            mental = currentMember.mental;
            tactical = currentMember.tactical;
        });
        unsubscribe();
        currentId = selectedID;
    } else {
        name = "";
        physical = 0;
        mental = 0;
        tactical = 0;
    }	
}

    function saveMember(){
        squad.updateSquadron(
            selectedID, 
            {
                id: 0,
                name: name,
                physical: physical,
                mental: mental,
                tactical: tactical
            });
        clearForm();
    }

    function clearForm(){
        currentId = 0;
        dispatch("editor-complete");
    }
</script>
<style>
.card {
		margin-bottom: 10px !important;
	}

	.card-header {
		font-weight: bold;
		font-size: large;
	}

	button {
		width: 100px;
		margin-left: 5px;
	}
</style>
<div id="accordion">
    <div class="card">
        <div class="card-header" id="headingEdit">
            <a class="btn btn-link" data-toggle="collapse" href="#collapseEdit" role="button" aria-expanded="true" aria-controls="collapseEdit">Add / Edit Squad Member</a>
        </div>
        <div id="collapseEdit" class="collapse show" aria-labelledby="headingEdit" data-parent="#accordion">
            <div class="card-body">
                <form>
                    <div class="form-group">
                        <label for="memberName">Name:</label>
                        <input type="text" class="form-control" id="memberName" placeholder="Squad Member Name" bind:value={name}>
                    </div>
                    <div class="form-row">
                        <div class="form-group col-md-4">
                            <label for="physicalScore">Physical:</label>
                            <input type="number" class="form-control" id="physicalScore" placeholder="0" bind:value={physical}>
                        </div>
                        <div class="form-group col-md-4">
                            <label for="mentalScore">Mental:</label>
                            <input type="text" class="form-control" id="mentalScore" placeholder="0" bind:value={mental}>
                        </div>
                        <div class="form-group col-md-4">
                            <label for="tacticalScore">Tactical:</label>
                            <input type="text" class="form-control" id="tacticalScore" placeholder="0" bind:value={tactical}>
                        </div>
                        <div class="col-md-12">							
                            <button class="btn btn-secondary float-right" on:click|preventDefault={clearForm}>Cancel</button>
                            <button class="btn btn-primary float-right" on:click|preventDefault={saveMember}>Save</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>