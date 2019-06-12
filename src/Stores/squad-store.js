import { writable } from "svelte/store";

const appSquadStore = writable([]);

const squad = {
    subscribe: appSquadStore.subscribe,
    set: appSquadStore.set,
    init: () => {
        var members = JSON.parse(localStorage.getItem("members"));
		if(members === null || members === ""){
			fetch('https://localhost:44365/api/Squad/Roster')
			.then(rlt => {
				if(!rlt.ok){
					throw new Error("Failed!");
				}
				return rlt.json();
			})
			.then(data => {
				appSquadStore.set(data);
			})
			.catch(err => {
				console.log(err);
			});
		} else {
			appSquadStore.set(members);
		}
    },
    updateSquadron: (id, memberData) => {
        appSquadStore.update(members => {
            const idx = members.findIndex(m => m.id === id);
            const member = members[idx];
            const updatedMembers = [...members];
            updatedMembers[idx] = {
                id: member.id,
                name: memberData.name,
                physical: memberData.physical,
                mental: memberData.mental,
                tactical: memberData.tactical,
                selected: false,
                active: false
            };

            if (typeof(Storage) !== "undefined" && updatedMembers.length > 0) {
                localStorage.setItem("members", JSON.stringify(updatedMembers));
            }

            return updatedMembers;
        });
    }
};

export default squad;