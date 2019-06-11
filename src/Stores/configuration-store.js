import { writable } from "svelte/store";

const squadConfiguration = writable([]);

const squadConfig = {
    subscribe: squadConfiguration.subscribe,
    set: squadConfiguration.set,
    init: () => {
        fetch('https://localhost:44365/api/Squad/Attributes')
		.then(rlt => {
			if(!rlt.ok){
				throw new Error("Failed!");
			}
			return rlt.json();
		})
		.then(data => {
			squadConfig.set(data);
		})
		.catch(err => {
			console.log(err);
		});
    }
};

export default squadConfig;