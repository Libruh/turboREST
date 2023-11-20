const { spotify } = require("../config.json")
const axios = require("axios")
const qs = require('qs');

const clientID = spotify.clientId
const clientSecret = spotify.clientSecret

const getToken = async () => {
    const result = await axios({
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        headers: {
            'Content-Type' : 'application/x-www-form-urlencoded', 
            'Authorization' : 'Basic ' + Buffer.from(clientID + ':' + clientSecret).toString('base64')
        },
        data: qs.stringify({
            'grant_type': 'client_credentials'
        })
    }).catch( err => {
        console.log(err);
    })

    const data = result.data;
    return data.access_token;
}

const getTracks = async trackIDs => {
    let tracks = {};
    let token = await getToken();

    queryLength = Math.ceil(trackIDs.length/50)
    searchQueries = []

    for (let i = 0; i < queryLength; i++) {
        searchQueries.push([])     
    }

    let trackCount = 0;
    let queryIndex = 0;

    for (const index in trackIDs) {
        trackID = trackIDs[index]
        if(trackCount == 50){
            queryIndex = queryIndex+1;
            trackCount = 0;
        }
        searchQueries[queryIndex].push(trackID)
        trackCount = trackCount+1
    }

    for (let i = 0; i < queryLength; i++) {
        trackIDchunk = searchQueries[i];
        trackIDstring = trackIDchunk.join(',')

        const result = await axios({
            method: 'get',
            url: 'https://api.spotify.com/v1/tracks/?ids='+trackIDstring,
            headers: { 'Authorization' : 'Bearer ' + token},
        }).catch( err => {
            console.log("error");
            console.log(err)
        })
        
        const data = await result.data;

        for (const index in data) {
            for (let i = 0; i < data[index].length; i++) {
                const track = data[index][i];
                tracks[track.id] = track
            }
        }
    }

    return tracks
}

const getPlaylist = async playlistID => {
    let token = await getToken();

    const result = await axios({
        method: 'get',
        url: `https://api.spotify.com/v1/playlists/${playlistID}?fields=name,images,description`,
        headers: { 'Authorization' : 'Bearer ' + token}
    }).catch( err => {
        console.log("error");
    })
    
    const data = await result.data;
    data.href="https://open.spotify.com/playlist/"+playlistID
    return data
}

let hitAttempts = 0;

const getRelatedArtists = async artistId => {

    let token = await getToken();

    const result = await axios({
        method: 'get',
        url: `https://api.spotify.com/v1/artists/${artistId}/related-artists`,
        headers: { 'Authorization' : 'Bearer ' + token}
    }).catch( err => {
        console.log(`error on hit hit #${hitAttempts}: ${artistId}`);
        console.log("error", err);
    })
    
    hitAttempts+=1;
    console.log(`hit #${hitAttempts}: ${artistId}`);
    return result.data
}

const getArtist = async artistId => {

    let token = await getToken();

    const result = await axios({
        method: 'get',
        url: `	https://api.spotify.com/v1/artists/${artistId}`,
        headers: { 'Authorization' : 'Bearer ' + token}
    }).catch( err => {
        console.log("error");
    })
    
    return result.data
}

const getArtists = async artistIds => {

    let token = await getToken();

    const result = await axios({
        method: 'get',
        url: `https://api.spotify.com/v1/artists?ids=${encodeURIComponent(artistIds)}`,
        headers: { 'Authorization' : 'Bearer ' + token}
    }).catch( err => {
        console.log(err.response.data);
    })

    return result.data
}

module.exports = { getTracks, getPlaylist, getRelatedArtists, getArtist, getArtists }