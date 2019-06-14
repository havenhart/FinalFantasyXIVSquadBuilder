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
    },
    activate: (details) => {
        appSquadStore.update(members => {
            for(let i = 0; i < members.length; i++){
                members[i].active = false;
            }

            if(details.member1 > -1){ members[details.member1].active = true; }
            if(details.member2 > -1){ members[details.member2].active = true; }
            if(details.member3 > -1){ members[details.member3].active = true; }
            if(details.member4 > -1){ members[details.member4].active = true; }

            return members;
        });
    }
};

export default squad;