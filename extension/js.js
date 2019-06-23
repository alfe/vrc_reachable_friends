var rowUserInfos = [];

/* Render Group */
const appendGroups = (worldArr) => {
    worldArr.forEach((users, i) => {
        const worldId = users[0].location.split("~")[0];
        const type = !users[0].location.includes('~') ? 'Public' : 'Friend';
        $('#reachable-friend').append(`
            <div class="flex world-block">
                <div class="world-type world-type-${type}">${type}</div>
                <div id="wrd_${type}_${i}" class="world-group"></div>
                <div class="world-info">
                    <img id="wrd_${type}_${i}_img">
                    <div class="flex">
                        <a id="wrd_${type}_${i}_join" href="vrchat://launch?ref=vrchat.com&id=${users[0].location}">JOIN</a>
                        <a id="wrd_${type}_${i}_name" href="/home/world/${worldId.split(":")[0]}">${worldId.split(":")[0]}</a>
                    </div>
                </div>
            </div>
        `);
        // world name/img replace
        $.get(`/api/1/worlds/${worldId.split(":")[0]}`).then( wrdInfo => {
            $(`#wrd_${type}_${i}_img`).attr('src', wrdInfo.thumbnailImageUrl);
            $(`#wrd_${type}_${i}_name`).text(wrdInfo.name);
            const instances = wrdInfo.instances.filter(instanceInfo => instanceInfo[0].split("~")[0] === worldId.split(":")[1]);
            if (instances.length !== 0) {
                $(`#wrd_${type}_${i}_join`).text(`JOIN (${instances[0][1]}人)`);
            }
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

const getWorldArray = (users) => {
    const worlds = {};
    users.map(user => {
        if (user.location === "offline" || user.location === "private") return;
        if (!user.location.includes('~')) {
            const wrld_hash = user.location;
            (wrld_hash in worlds)
                ? worlds[wrld_hash].push(user)
                : worlds[wrld_hash] = [user];
        }
        if (user.location.includes('~')) {
            const wrld_hash = user.location.split("~")[0];
            (wrld_hash in worlds)
                ? worlds[wrld_hash].push(user)
                : worlds[wrld_hash] = [user];
        }
    })
    return worlds;
}
const renderReachableFriend = () => {
    if (rowUserInfos.length === 0) { return };
    console.info(`${rowUserInfos.length} friends loaded`);
    const worlds = getWorldArray(rowUserInfos);
    $('#reachable-friend').html('');
    appendGroups(Object.values(worlds).sort((a, b) => (a.length < b.length) ? 1 : -1));

};

const vrcFriend = () => {
    // TODO: use promise
    rowUserInfos = [];
    $.get("/api/1/auth/user/friends?offline=false&offset=200").then( e => {
        rowUserInfos = [...rowUserInfos, ...e];
        renderReachableFriend();
    });
    $.get("/api/1/auth/user/friends?offline=false&offset=100").then( e => {
        rowUserInfos = [...rowUserInfos, ...e];
        renderReachableFriend();
    });
    $.get("/api/1/auth/user/friends?offline=false").then( e => {
        rowUserInfos = [...rowUserInfos, ...e];
        renderReachableFriend();
    });
};

const init = () => {
    $('.home-content .center-block')
    	.append('<button id="reload-friend"><span class="fas fa-sync"></span></button>')
    	.append('<div id="reachable-friend"></div>');

    if ($('#reachable-friend').length === 0) {
        setTimeout(init, 3000);
        console.info('cannot make reload button');
        return;
    }

    console.info('start friends loading');
    vrcFriend();
    $('#reload-friend').on('click', vrcFriend);
}

window.onload = () => {
    window.addEventListener("hashchange", () => { 
        setTimeout(init, 2000);
    }, false);
    setTimeout(init, 2000);
};

