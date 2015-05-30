module.exports = function(pluto) {

    var data = pluto.getStorage("users")||{};

    var musicModule = {};

    pluto.get("/music/play", function(req, res) {
        var selectedUser = {};
        var ids = Object.keys(data);
        do {
            selectedUser = data[ids[Math.floor(Math.random()*ids.length)]];
        } while (!selectedUser.artists);
        console.log(selectedUser.name + "'s choice");
        var selectedArtist = selectedUser.artists[Math.floor(Math.random()*selectedUser.artists.length)];
        pluto.request("https://api.spotify.com/v1/search?q=" + encodeURIComponent(selectedArtist) + "&type=artist", function(res) {
            if (res.status != 200) {
                console.log("An error occurred: response " + res.status);
                return;
            }
            var artist = res.body.artists.items[0];
            console.log("Selected artist " + artist.name);
            pluto.request("https://api.spotify.com/v1/artists/" + artist.id + "/albums", function(res) {
                if (res.status != 200) {
                    console.log("An error occurred: response " + res.status);
                    return;
                }
                var albums = res.body.items;
                var selectedAlbum = albums[Math.floor(Math.random()*albums.length)];
                console.log("Selected album " + selectedAlbum.name);
                pluto.request("https://api.spotify.com/v1/albums/" + selectedAlbum.id + "/tracks", function(res) {
                    if (res.status != 200) {
                        console.log("An error occurred: response " + res.status);
                        return;
                    }

                    var songs = res.body.items;
                    var selectedSong = songs[Math.floor(Math.random()*songs.length)];
                    console.log("Selected song " + selectedSong.name);
                    pluto.emitEvent("music::play", {
                        name: selectedSong.name,
                        album: selectedAlbum.name,
                        artist: selectedArtist
                    });
                });
            });
        });
        res.send("Playing music");
    });

    return musicModule;
}
