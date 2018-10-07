const vrcFriend = () => {
    $.get("https://www.vrchat.net/api/1/auth/user/friends?offline=false").then( e =>{
        $('#reachable-friend').html('');
        // for grouping
        const public_worlds = {};
        const private_worlds = {};
        e.map(user => {
            if (user.location === "offline" || user.location === "private") return;
            if (!user.location.includes('~')) {
                const wrld_hash = user.location;
                (wrld_hash in public_worlds)
                    ? public_worlds[wrld_hash].push(user)
                    : public_worlds[wrld_hash] = [user];
            }
            if (user.location.includes('~')) {
                const wrld_hash = user.location.split("~")[0];
                (wrld_hash in private_worlds)
                    ? private_worlds[wrld_hash].push(user)
                    : private_worlds[wrld_hash] = [user];
            }
        })
        const compare = (a,b) => (a.length < b.length) ? 1 : -1;
        const public_worldsArr = Object.values(public_worlds).sort(compare);
        const private_worldsArr = Object.values(private_worlds).sort(compare);

        // for appending
        const appendGroups = (worldArr, type) => {
            $('#reachable-friend').append(`<h3>${type}</h3>`);
            worldArr.forEach((users, i) => {
                const worldId = users[0].location.split("~")[0];
                $('#reachable-friend').append(`
                    <div class="flex">
                        <a id="wrd_${type}_${i}" class="world-group"
                            href="vrchat://launch?ref=vrchat.com&id=${users[0].location}">
                        </a>
                        <div class="world-info">
                            <img id="wrd_${type}_${i}_img">
                            <a id="wrd_${type}_${i}_name" href="https://www.vrchat.net/home/world/${worldId.split(":")[0]}">${worldId.split(":")[0]}</a>
                        </div>
                    </div>
                `);
                // world name/img replace
                $.get(`https://www.vrchat.net/api/1/worlds/${worldId.split(":")[0]}`).then( e => {
                    $(`#wrd_${type}_${i}_img`).attr('src', e.thumbnailImageUrl);
                    $(`#wrd_${type}_${i}_name`).text(e.name);
                });

                // show user
                users.forEach(user => {
                    $(`#wrd_${type}_${i}`).append(`<div>
	                    <img width="150" src=${user.currentAvatarThumbnailImageUrl}>
	                    <span class="user-name">${user.displayName}
		                    ${user.status === 'active' ? `<span style="color: green">●</span>`
		                    : user.status === 'busy' ? `<span style="color: red">●</span>`
		                    : user.status === 'join me' ? `<span style="color: blue">●</span>`
		                    : `<span></span>`}
		                    ${user.statusDescription.length === 0 ? '' 
		                	: `<br/><span class="user-status-description">${user.statusDescription}</span>`}
	                    </span>
	                </div>`);
                });
            });
        }
        appendGroups(public_worldsArr, 'Public');
        appendGroups(private_worldsArr, 'Friend');
    })
};

const init = () => {
    console.info('start friends loading');
    $('.home-content .center-block').append('<button id="reload-friend">Reload</button>').append('<div id="reachable-friend"></div>');

    if ($('#reachable-friend').length === 0) {
        setTimeout(init, 3000);
        console.info('cannot make reload button');
        return;
    }
    
    vrcFriend();
    $('#reload-friend').on('click', () => {
        vrcFriend();
    });
    console.info('end friends loading');
}

window.onload = () => {
    window.addEventListener("hashchange", () => { 
        setTimeout(init, 2000);
    }, false);
    setTimeout(init, 2000);
};

