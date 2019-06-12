<script>
    import { createEventDispatcher } from"svelte";
    import squadConfig from "../Stores/configuration-store.js";

    const dispatch = createEventDispatcher();

    $:squadatt = $squadConfig.find(s => s.name === "Squadron") || {physical: 0, mental: 0, tactical: 0}
    $:missionatt = $squadConfig.find(s => s.name === "Mission") || {physical: 0, mental: 0, tactical: 0}

    function OnCalculate(){
        squadConfig.updateConfiguration(squadatt,missionatt);
        dispatch("calculate");
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

<div class="card">
    <div class="card-header">Calculate Squad Configuration</div>
    <div class="card-body">
    <b>Squadron Attributes</b>
        <div class="form-row">
            <div class="form-group col-md-4">
                <label for="physicalScore">Physical:</label>
                <input type="number" class="form-control" id="physicalScore" placeholder="0" bind:value={squadatt.physical}>
            </div>
            <div class="form-group col-md-4">
                <label for="mentalScore">Mental:</label>
                <input type="number" class="form-control" id="mentalScore" placeholder="0" bind:value={squadatt.mental}>
            </div>
            <div class="form-group col-md-4">
                <label for="tacticalScore">Tactical:</label>
                <input type="number" class="form-control" id="tacticalScore" placeholder="0" bind:value={squadatt.tactical}>
            </div>
        </div>
        <b>Required Attributes</b>
        <div class="form-row">
            <div class="form-group col-md-4">
                <label for="physicalScore">Physical:</label>
                <input type="number" class="form-control" id="physicalScore" placeholder="0" bind:value={missionatt.physical}>
            </div>
            <div class="form-group col-md-4">
                <label for="mentalScore">Mental:</label>
                <input type="number" class="form-control" id="mentalScore" placeholder="0" bind:value={missionatt.mental}>
            </div>
            <div class="form-group col-md-4">
                <label for="tacticalScore">Tactical:</label>
                <input type="number" class="form-control" id="tacticalScore" placeholder="0" bind:value={missionatt.tactical}>
            </div>
            <div class="col-md-12">							
                <button class="btn btn-primary float-right" on:click={OnCalculate}>Calculate</button>
            </div>
        </div>
        <b>Current Attributes</b>
        <div class="form-row">
            <div class="form-group col-md-4">
                <label for="physicalScore">Physical:</label>
                <input type="text" class="form-control" id="physicalScore" placeholder="0" readonly>
            </div>
            <div class="form-group col-md-4">
                <label for="mentalScore">Mental:</label>
                <input type="text" class="form-control" id="mentalScore" placeholder="0" readonly>
            </div>
            <div class="form-group col-md-4">
                <label for="tacticalScore">Tactical:</label>
                <input type="text" class="form-control" id="tacticalScore" placeholder="0" readonly>
            </div>
        </div>
        <b>Recommended Training:</b>
    </div>
</div>