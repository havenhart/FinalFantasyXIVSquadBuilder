import { writable } from "svelte/store";

const squadConfiguration = writable([]);

const squadConfig = {
    subscribe: squadConfiguration.subscribe,
    set: squadConfiguration.set,
    init: () => {
		var configs = JSON.parse(localStorage.getItem("configs"));
		if(configs === null || configs === "") {
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
		else {
			squadConfig.set(configs);
		}
	},
	updateConfiguration: (squadatt,configatt) => {
		squadConfiguration.update(configs => {
			var data = [squadatt,configatt];
			if (typeof(Storage) !== "undefined") {
                localStorage.setItem("configs", JSON.stringify(data));
            }
			return data;
		});
	}
};

export default squadConfig;