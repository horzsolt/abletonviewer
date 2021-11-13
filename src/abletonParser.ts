import AbletonTracks from './abletonTracks';

export default class AbletonParser { 

    public static parse(xmlData: string): AbletonTracks {
        var parseString = require('xml2js').parseString;
        var ableton = new AbletonTracks();

        parseString(xmlData, function (err: any, result: any) {
            ableton.creator = result.Ableton.$.Creator;
            var numOfTracks = result.Ableton.LiveSet[0].Tracks[0].AudioTrack.length;

            for (let i = 0; i < numOfTracks; i++) { 
                var audioTrack = result.Ableton.LiveSet[0].Tracks[0].AudioTrack[i].DeviceChain[0].MainSequencer[0].Sample[0].ArrangerAutomation[0].Events[0].AudioClip;
                var trackList = Array<string>();

                audioTrack.forEach(function (item: any, index: any) {
                    trackList.push("[ID: " + item.$.Id + " Duration: " + item.CurrentStart[0].$.Value + " - " + item.CurrentEnd[0].$.Value + "] " + item.Name[0].$.Value);
                });

                ableton.addTrackList(i + 1 + ".", trackList);
            }
        });

        return ableton;
    }
 }